import $ from 'jquery';
import _ from 'lodash';
import 'bootstrap-datepicker/dist/js/bootstrap-datepicker.js';
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker.css';
import './datepicker.scss';

$.fn.datepicker.dates.fr = {
    days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    daysShort: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
    daysMin: ['d', 'l', 'ma', 'me', 'j', 'v', 's'],
    months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    monthsShort: ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
    today: 'Aujourd\'hui',
    monthsTitle: 'Mois',
    clear: 'Effacer',
    weekStart: 1,
    format: 'dd/mm/yyyy'
};

export const convertIntoDatepicker = (input, options) => {
    let noop = () => ({});

    $(input).datepicker(_.omit(options, ['onChange']));
    $(input).on('changeDate', options.onChange || noop);
};

export const updateDatepicker = (input, value) => $(input).datepicker('update', value);

export const clearDates = input => $(input).datepicker('clearDates');

export const setStartDate = (input, value) => $(input).datepicker('setStartDate', value);

export const setEndDate = (input, value) => $(input).datepicker('setEndDate', value);
