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

//Fonction d'envoie de requête et de traitement du résultat
	
function findelt(){
	var elt= document.getElementById("searchelt").value;		//Récupère la saisie de l'utilisateur dans le champs prévu
	var splitelt = new Array;
	var JSONlist = new Array;
	if(elt==null || elt==""){									//Vérifie la présence d'une saisie
		alert("Vous n'avez pas effectué de saisie");
	}
	else if(regexchar.test(elt)){								//Vérifie la validité de la saisie
		alert("Caractères spéciaux détectés");	
	}
	else {														//Découpage des différents éléments saisie, sous forme d'un tableau.
		var regexseparator=/[+]/;
		if	(regexseparator.test(elt)){
			splitelt= elt.split("+");		
			
		}
		else{
		splitelt[0]=elt;
		}
	for (var i=0;i<splitelt.length;i++){		// Pour chaque éléments
		JSONlist.push( {elt_id: splitelt[i]});	// On formate l'élément en objet JSON et on le place dans un tableau d'objet JSON
		}
	var res = $.ajax({	// Requête GET contenant le tableau d'objet JSON envoyé au serveur
		type: 'POST',
		crossDomain: true,
		url: window.location.protocol +'//' + window.location.hostname + ':8081/',
		data: {elt:JSONlist},
		dataType: 'json',
		success: function (data, textStatus, jqXHR) {		//En cas d'aboutissement de la requête on effectue les traitements suivant
			callback(data);
			}
		});
	}
};

function callback(json){
	markers.clearLayers();										// Suppression marqueur précédemment enregistré
	setmarkers(json);											// Création des nouveaux marqueurs
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
	var southWest = L.latLng(getMaxOfArray(latlist), getMaxOfArray(lonlist)),		// La coordonnée la plus au Sud-Ouest
    northEast = L.latLng(getMinOfArray(latlist), getMinOfArray(lonlist)),			// La coordonnée la plus au Nord-Est
    bounds =L.latLngBounds(southWest, northEast),									// Définition du rectangle contenant toutes les coordonnées
	formatmap=L.extend(bounds);
	map.fitBounds(formatmap); 														//Formatage de la carte
};

//Fonction permettant de récuperer la valeur maximal d'un tableau

function getMaxOfArray(numArray) {
    return Math.max.apply(null, numArray);
};

//Fonction permettant de récuperer la valeur minimal d'un tableau


function getMinOfArray(numArray) {
    return Math.min.apply(null, numArray);
};