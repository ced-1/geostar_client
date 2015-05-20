var markers= new L.layerGroup();
var polygons= new L.layerGroup();
var markcenter;
var regexspace=/^ *$/;
var regexchar=/[!@#$%^&*()\/|<>"]|\\/;								// expression caractere speciaux
var map = L.map('map').setView([-20.98, 55.50], 5);
var geolocate = document.getElementById('geolocate');
		L.tileLayer(window.location.protocol +'//' + window.location.hostname+'/osm_tiles/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
			
}).addTo(map);

$('#searchelt').keypress(function(e){
    if( e.which == 13 ){
	e.preventDefault();
	findelt()
    }
});


//Fonction d'envoie de requ�te et de traitement du r�sultat
	
function findelt(){
	var placetype = new Array;
	var elt= document.getElementById("searchelt").value;		//R�cup�re la saisie de l'utilisateur dans le champs pr�vu
	var splitelt = new Array;
	var JSONlist = new Array;
	for (var i=0;i<3;i++){
		if(document.getElementById(i).checked){
			placetype.push(document.getElementById(i).value);
			}
		}
	if(elt==null || regexspace.test(elt)){									//V�rifie la pr�sence d'une saisie
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
		if (!(regexspace.test(splitelt[i]))){				// Verification que l'element peut �tre valide � la requete
			JSONlist.push( {elt_id: splitelt[i]});	// On formate l'�l�ment en objet JSON et on le place dans un tableau d'objet JSON
			}
		}
	var res = $.ajax({	// Requ�te GET contenant le tableau d'objet JSON envoy� au serveur
		type: 'POST',
		url: window.location.protocol +'//' + window.location.hostname + ':8080/',
		data: {'elt':JSONlist, 'placetype':placetype},
		dataType: 'json',
		success: function (data, textStatus, jqXHR) {		//En cas d'aboutissement de la requ�te on effectue les traitements suivant
			console.log(data);
			callback(data);
			}
		});
	}
};

function callback(json){
	markers.clearLayers();										// Suppression marqueur pr�c�demment enregistr�
	polygons.clearLayers();
	var listfinal= checkJSON(json);
	if(listfinal.length!=0){
	setaffichage(listfinal);
	setmarkers(listfinal);											// Cr�ation des nouveaux marqueurs
	polygons.addTo(map);
	markers.addTo(map);											// Mise en place des nouveaux marqueurs sur la map
	
	}										// Formatage de la carte
}

//Fonction de verification des elements affichable et non affichable

function checkJSON(list){
	var JSONlist= new Array();
	var error="";
	for (var i=0; i<list.length; i++){
		if(list[i].err!=0){
			if(list[i].type ==1 && list[i].err==1){
				error+="L'ip "+ list[i].elt_id+" n'est pas present dans la BDD\n";
			}
			else if(list[i].type ==2 && list[i].err==1){
				error+="Aucune correspondance geocoding trouv� pour "+ list[i].elt_id+"\n";
			}
			else if(list[i].type ==2 && list[i].err==2){
				error+="Geocoder non disponible ou surcharg�e durant la requ�te sur " + list[i].elt_id+"\n";
			}
		}
		else{
				JSONlist.push(list[i]);
		}
		}
		if(error!=""){
		alert(error);}
		return JSONlist;
}		
//Fonction de creation et stockage des marqueurs

function setmarkers(list){
var marker;
var mpolygon;
	markers= new L.layerGroup();
	polygons= new L.layerGroup();
for (var i=0; i<list.length; i++){
	var element;
	var value=null;
	if((list[i].elt_id).indexOf(":")>-1){
		element = list[i].elt_id.split(":")[0];
		value = list[i].elt_id.split(":")[1];

		}
	else{
		element = list[i].elt_id;
	}
	if(value){
	marker= L.circle([parseFloat(list[i].lat), parseFloat(list[i].lon)], parseInt(value), {
				color: 'red',
				fillColor: '#f03',
				fillOpacity: 0.7
			});
	}
	else{
		marker=L.marker([parseFloat(list[i].lat),parseFloat(list[i].lon)]);
	}
	if(list[i].type==2){

		if(list[i].polygon){
			console.log(list[i].polygon);
			mpolygon=L.polygon(list[i].polygon);
			polygons.addLayer(mpolygon);
		}
	


		if(list[i].pop){
			console.log("ici");
			marker.bindPopup("<b>"+element+"</b></br>Real name:"+list[i].elt_name +"</br>Population:"+list[i].pop);
			}
		else{
			marker.bindPopup("<b>"+element+"</b></br>Real name:"+list[i].elt_name +"</br>Population:"+list[i].pop);
			}
	}
	
	else{
		marker.bindPopup("<b>"+element+"</b>");
		}
	markers.addLayer(marker);
		console.log(value);

	}
};

//Fonction de formatage minimal de la carte

function setaffichage(list){
var latlist= new Array;
var lonlist= new Array;
	for (var i=0; i<list.length; i++){
		if(list[i].bounds){
			latlist.push(parseFloat(list[i].bounds.ne.lat));
			latlist.push(parseFloat(list[i].bounds.sw.lat));
			lonlist.push(parseFloat(list[i].bounds.ne.lng));
			lonlist.push(parseFloat(list[i].bounds.sw.lng));
		}
		else{
			latlist.push(parseFloat(list[i].lat))
			lonlist.push(parseFloat(list[i].lon))
		}
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