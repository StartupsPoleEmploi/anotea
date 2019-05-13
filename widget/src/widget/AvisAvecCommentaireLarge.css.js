const style = `

.avis-avec-commentaire.large {
    white-space: normal;
}

.avis-avec-commentaire.large h2 {
    color: #24303A;
	font-size: 0.7em;
	font-weight: bold;
	line-height: 15px;
    text-transform: uppercase;
    display: inline;
    margin: 12px;
}

.avis-avec-commentaire.large .commentaires-header {
    display: inline-block;
}

.avis-avec-commentaire.large .verified {
    display: inline-block;
    float: right;
    padding: 0;
    position: relative;
    top: -5px;
    margin-right: 20px;
}

.avis-avec-commentaire.large .avis {
    border: 1px solid #C8CBCE;
	border-radius: 5px;
    background-color: white;
    padding: 0;
    margin: 15px;
}

.avis-avec-commentaire.large .avis > * {
    padding: 0px 10px;
}

.avis-avec-commentaire.large .avis .stars {
    font-size: 0.7em;
}

.avis-avec-commentaire.large .pseudo {
	opacity: 0.87;
	color: #24303A;
	font-size: 14px;
    line-height: 20px;
    font-weight: normal;
}

.avis-avec-commentaire.large .avis .titre, .answer .titre {
	opacity: 0.87;
	color: #24303A;
	font-size: 14px;
	font-weight: bold;
    line-height: 20px;
    margin: 5px 0px;
}

.avis-avec-commentaire.large .avis .texte, .answer .texte {
	opacity: 0.87;
	color: #24303A;
	font-size: 14px;
    line-height: 20px;
    font-weight: normal;
    margin-bottom: 10px;
}

.avis-avec-commentaire.large .pagination {
    margin: auto;
    width: fit-content;
}

.avis-avec-commentaire.large .pageIndicator:first-child {
    border-radius: 4px 0px 0px 4px;
}


.avis-avec-commentaire.large .pageIndicator:last-child {
    border-radius: 0px 4px 4px 0px;
}

.avis-avec-commentaire.large .pageIndicator {
	height: 38px;
	width: 41px;
	border: 1px solid #F4F4F4;
    background-color: #FFFFFF;
    display: inline-block;
	color: #8E9093;
	font-size: 14px;
	line-height: 38px;
    text-align: center;
    margin: 0px;
    cursor: pointer;
}

.avis-avec-commentaire.large .pageIndicator.current {
    background-color: #F4F4F4;
}

.avis-avec-commentaire.large .line {
	box-sizing: border-box;
	height: 1px;
	width: 60px;
    border: 1px solid #C8CBCE;
    display: inline-block;
    position: relative;
    top: -3px;
}

.avis-avec-commentaire.large .nav {
    cursor: pointer;
}

.avis-avec-commentaire.large .date {
	opacity: 0.87;
	color: #91979C;
	font-size: 12px;
    line-height: 16px;
    border-top: 1px solid #C8CBCE;
    padding: 8px 16px;
}

.avis-avec-commentaire.large .pas-commentaire {
    color: rgba(36, 48, 58, 0.6);
    font-size: 0.8em;
    font-weight: normal;
    margin: 15px;
    text-align: center;
    margin-top: 120px;
}

.avis-avec-commentaire.large .answer {
    border-left: 1px solid black;
    margin-left: 10px;
}

`;
export default style;