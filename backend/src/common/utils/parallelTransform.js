/**
 * Fork of https://github.com/mafintosh/parallel-transform
 * This fork allows finish event to be emitted when all promises returned by onTransform are resolved
 */
const Transform = require('readable-stream').Transform;
const inherits = require('inherits');
const cyclist = require('cyclist');

let ParallelTransform = function(maxParallel, opts, onTransform) {
    if (!(this instanceof ParallelTransform)) {
        return new ParallelTransform(maxParallel, opts, onTransform);
    }

    if (typeof maxParallel === 'function') {
        onTransform = maxParallel;
        opts = null;
        maxParallel = 1;
    }
    if (typeof opts === 'function') {
        onTransform = opts;
        opts = null;
    }

    if (!opts) {
        opts = {};
    }
    if (!opts.highWaterMark) {
        opts.highWaterMark = Math.max(maxParallel, 16);
    }
    if (opts.objectMode !== false) {
        opts.objectMode = true;
    }

    Transform.call(this, opts);

    this._maxParallel = maxParallel;
    this._onTransform = onTransform;
    this._destroyed = false;
    this._flushed = false;
    this._ordered = opts.ordered !== false;
    this._buffer = this._ordered ? cyclist(maxParallel) : [];
    this._top = 0;
    this._bottom = 0;
    this._ondrain = null;
};

inherits(ParallelTransform, Transform);

ParallelTransform.prototype.destroy = function() {
    if (this._destroyed) {
        return;
    }
    this._destroyed = true;
    this.emit('close');
};

ParallelTransform.prototype._transform = async function(chunk, enc, callback) {
    let self = this;
    let pos = this._top++;
    let promises = [];

    if (promises.length >= this._maxParallel) {
        await Promise.all(promises);
        promises = [];
    }

    let promise = this._onTransform(chunk, function(err, data) {
        if (self._destroyed) {
            return;
        }
        if (err) {
            self.emit('error', err);
            self.push(null);
            self.destroy();
            return;
        }
        if (self._ordered) {
            self._buffer.put(pos, (data === undefined || data === null) ? null : data);
        } else {
            self._buffer.push(data);
        }
        self._drain();
    });
    promises.push(promise);

    if (this._top - this._bottom < this._maxParallel) {
        await Promise.all(promises);
        return callback();
    }
    this._ondrain = callback;
};

ParallelTransform.prototype._flush = function(callback) {
    this._flushed = true;
    this._ondrain = callback;
    this._drain();
};

ParallelTransform.prototype._drain = function() {
    if (this._ordered) {
        while (this._buffer.get(this._bottom) !== undefined) {
            let data = this._buffer.del(this._bottom++);
            if (data === null) {
                continue;
            }
            this.push(data);
        }
    } else {
        while (this._buffer.length > 0) {
            let data = this._buffer.pop();
            this._bottom++;
            if (data === null) {
                continue;
            }
            this.push(data);
        }
    }


    if (!this._drained() || !this._ondrain) {
        return;
    }

    let ondrain = this._ondrain;
    this._ondrain = null;
    ondrain();
};

ParallelTransform.prototype._drained = function() {
    let diff = this._top - this._bottom;
    return this._flushed ? !diff : diff < this._maxParallel;
};

module.exports = ParallelTransform;

