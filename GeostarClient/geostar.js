var markers= new L.layerGroup();
var markcenter;
var regexchar=/[!@#$%^&*()\/|<>"]|\\/;								// expression caractere speciaux
var map = L.map('map').setView([-20.98, 55.50], 5);
var geolocate = document.getElementById('geolocate');
		L.tileLayer(window.location.protocol + "//" + window.location.hostname+'/osm_tiles/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
			
}).addTo(map);




$('#recherche').keypress(function(e){
    if( e.which == 13 ){
	findelt()
    }
});

//Fonction d'envoie de requ�te et de traitement du r�sultat
	
function findelt(){
	var elt= document.getElementById("searchelt").value;		//R�cup�re la saisie de l'utilisateur dans le champs pr�vu
	var splitelt = new Array;
	var JSONlist = new Array;
	if(elt==null || elt==""){									//V�rifie la pr�sence d'une saisie
		alert("Vous n'avez pas effectu� de saisie");
	}
	else if(regexchar.test(elt)){								//V�rifie la validit� de la saisie
		alert("Caract�res sp�ciaux d�tect�s");	
	}
	else {														//D�coupage des diff�rents �l�ments saisie, sous forme d'un tableau.
		var regexseparator=/[+]/;
		if	(regexseparator.test(elt)){
			splitelt= elt.split("+");		
			
		}
		else{
		splitelt[0]=elt;
		}
	for (var i=0;i<splitelt.length;i++){		// Pour chaque �l�ments
		JSONlist.push( {elt_id: splitelt[i]});	// On formate l'�l�ment en objet JSON et on le place dans un tableau d'objet JSON
		}
	var res = $.ajax({	// Requ�te GET contenant le tableau d'objet JSON envoy� au serveur
		type: 'POST',
		crossDomain: true,
		url: window.location.protocol +'//' + window.location.hostname + ':8081/',
		data: {elt:JSONlist},
		dataType: 'json',
		success: function (data, textStatus, jqXHR) {		//En cas d'aboutissement de la requ�te on effectue les traitements suivant
			callback(data);
			}
		});
	}
};

function callback(json){
	markers.clearLayers();										// Suppression marqueur pr�c�demment enregistr�
	setmarkers(json);											// Cr�ation des nouveaux marqueurs
	markers.addTo(map);											// Mise en place des nouveaux marqueurs sur la map
	setaffichage(json);											// Formatage de la carte
}

//Fonction de creation et stockage des marqueurs

function setmarkers(list){
var marker;
	markers= new L.layerGroup();

for (var i=0; i<list.length; i++){
	marker=L.marker([parseFloat(list[i].lat),parseFloat(list[i].lon)]).bindPopup("<b>Element "+(i+1)+"</br>"+list[i].elt_id +"</b>");
	markers.addLayer(marker);
	}
};

//Fonction de formatage minimal de la carte

function setaffichage(list){
var latlist= new Array;
var lonlist= new Array;
	for (var i=0; i<list.length; i++){
		latlist.push(parseFloat(list[i].lat))
		lonlist.push(parseFloat(list[i].lon))
	}	
	var southWest = L.latLng(getMaxOfArray(latlist), getMaxOfArray(lonlist)),		// La coordonn�e la plus au Sud-Ouest
    northEast = L.latLng(getMinOfArray(latlist), getMinOfArray(lonlist)),			// La coordonn�e la plus au Nord-Est
    bounds =L.latLngBounds(southWest, northEast),									// D�finition du rectangle contenant toutes les coordonn�es
	formatmap=L.extend(bounds);
	map.fitBounds(formatmap); 														//Formatage de la carte
};

//Fonction permettant de r�cuperer la valeur maximal d'un tableau

function getMaxOfArray(numArray) {
    return Math.max.apply(null, numArray);
};

//Fonction permettant de r�cuperer la valeur minimal d'un tableau


function getMinOfArray(numArray) {
    return Math.min.apply(null, numArray);
};