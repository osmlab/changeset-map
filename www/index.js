import React from 'react';
import { render } from 'react-dom';
import mapboxgl from 'mapbox-gl';
// import get from '../lib/getChangeset';
import { render as rander } from '../lib/render';
console.log(rander);
rander(document.getElementById('map'), '47876083', {
    height: 1000,
    width: 600
});
// mapboxgl.accessToken = 'pk.eyJ1IjoicmFzYWd5IiwiYSI6ImNpejVrMjc4eTAwNGczM2thNWozYnJ1OHkifQ.yFRr3Sd39TJiwEguQpIkWQ';
// var map = new mapboxgl.Map({
//     container: 'map', // container id
//     style: 'mapbox://styles/mapbox/streets-v9', //stylesheet location
//     center: [-74.50, 40], // starting position
//     zoom: 9 // starting zoom
// });
// get(
//     '47876083',
//     '//overpass-cfn-production.tilestream.net/api/interpreter',
//     function(err, result) {
//         console.log(err, result);
//     }
// );
render(
    <div>
        <h1>Hello Rollup+React+Redux!</h1>
    </div>,
    document.getElementById('root')
);
