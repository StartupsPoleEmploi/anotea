const style = `
h2 {
    color: #24303A;
	font-size: 0.7em;
	font-weight: bold;
	line-height: 15px;
    text-transform: uppercase;
    position: relative;
    top: -22px;
    background-color: white;
    padding: 5px;
    text-align: center;
    width: fit-content;
    margin: auto;
}

.commentaires-header {
    height: 25px;
    margin: 0px 18px 0px 18px;
}

.avis {
    border: 1px solid #C8CBCE;
	border-radius: 5px;
    background-color: white;
    padding: 0;
    margin: 15px;
}

.avis > * {
    padding: 0px 5px;
}

.avis .stars {
    font-size: 0.7em;
}

.pseudo {
	opacity: 0.87;
	color: #24303A;
	font-size: 14px;
    line-height: 20px;
    font-weight: normal;
}

.avis .titre {
	opacity: 0.87;
	color: #24303A;
	font-size: 14px;
	font-weight: bold;
    line-height: 20px;
    margin: 5px 0px;
}

.avis .texte {
	opacity: 0.87;
	color: #24303A;
	font-size: 14px;
    line-height: 20px;
    font-weight: normal;
    margin-bottom: 15px;
}

.pageIndicator {
	height: 16px;
	color: #24303A;
	font-size: 12px;
	line-height: 16px;
    text-align: center;
    font-weight: normal;
    margin: 10px;
}

.pagination {
    margin: auto;
    width: fit-content;
    padding: 15px;
}

.pagination .nav {
    border: 1px solid #C8CBCE;
    border-radius: 5px;
    color: #C8CBCE;
    padding: 10px 15px;
}

.pagination .nav-left, .pagination .nav-right {
    display: inline-block;
    width: 45px;
}

.pagination .pageIndicator {
    display: inline-block;
}

.line {
	box-sizing: border-box;
	height: 1px;
	width: 100%;
    border: 1px solid #C8CBCE;
    display: inline-block;
    position: relative;
    top: -3px;
}

.nav {
    cursor: pointer;
}

.date {
	opacity: 0.87;
	color: #91979C;
	font-size: 12px;
    line-height: 16px;
    border-top: 1px solid #C8CBCE;
    padding: 8px 16px;
}`;
export default style;