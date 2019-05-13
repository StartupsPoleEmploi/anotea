const style = `
.avis-avec-commentaire.small h2 {
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

.avis-avec-commentaire.small .commentaires-header {
    height: 25px;
    margin: 0px 18px 0px 18px;
}

.avis-avec-commentaire.small .avis {
    border: 1px solid #C8CBCE;
	border-radius: 5px;
    background-color: white;
    padding: 0;
    margin: 15px;
}

.avis-avec-commentaire.small .avis > * {
    padding: 0px 5px;
}

.avis-avec-commentaire.small .avis .stars {
    font-size: 0.7em;
}

.avis-avec-commentaire.small .avis .container {
    height: 200px;
}

.avis-avec-commentaire.small .pseudo {
	opacity: 0.87;
	color: #24303A;
	font-size: 14px;
    line-height: 20px;
    font-weight: normal;
}

.avis-avec-commentaire.small .avis .titre, .avis-avec-commentaire.small .answer .titre {
	opacity: 0.87;
	color: #24303A;
	font-size: 14px;
	font-weight: bold;
    line-height: 20px;
    margin: 5px 0px;
}

.avis-avec-commentaire.small .avis .texte, .avis-avec-commentaire.small.answer .texte {
	opacity: 0.87;
	color: #24303A;
	font-size: 14px;
    line-height: 20px;
    font-weight: normal;
    margin-bottom: 10px;
}

.avis-avec-commentaire.small .pageIndicator {
	height: 16px;
	color: #24303A;
	font-size: 12px;
	line-height: 16px;
    text-align: center;
    font-weight: normal;
    margin: 10px;
    clear: both;
    position: relative;
    top: -40px;
}

.avis-avec-commentaire.small .pagination {
    width: 100%;
}

.avis-avec-commentaire.small .pagination .nav {
    border: 1px solid #C8CBCE;
    border-radius: 5px;
    color: #C8CBCE;
    padding: 5px 9px;
    margin: 15px;
}

.avis-avec-commentaire.small .pagination .nav-right {
    float: right;
}

.avis-avec-commentaire.small .pagination .nav-left, .avis-avec-commentaire.small .pagination .nav-right {
    display: inline-block;
}

.avis-avec-commentaire.small .pagination .pageIndicator {
    display: block;
    margin: auto;
    width: fit-content;
}

.avis-avec-commentaire.small .line {
	box-sizing: border-box;
	height: 1px;
	width: 100%;
    border: 1px solid #C8CBCE;
    display: inline-block;
    position: relative;
    top: -3px;
}

.avis-avec-commentaire.small .nav {
    cursor: pointer;
}

.avis-avec-commentaire.small .date {
	opacity: 0.87;
	color: #91979C;
	font-size: 12px;
    line-height: 16px;
    border-top: 1px solid #C8CBCE;
    padding: 8px 16px;
}

.avis-avec-commentaire.small .pas-commentaire {
    color: rgba(36, 48, 58, 0.6);
    font-size: 0.7em;
    font-weight: normal;
    margin: 15px;
}
`;
export default style;