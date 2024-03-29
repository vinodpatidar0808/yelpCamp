mapboxgl.accessToken = mbxToken;
const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/streets-v11", // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    // center: [-74.5, 40],
    zoom: 10, // starting zoom
});

const nav = new mapboxgl.NavigationControl({
    visualizePitch: true,
});
map.addControl(nav, "top-right");

new mapboxgl.Marker({ color: "#b40219" })
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 35 }).setHTML(
            `<h3>${campground.title}</h3>`
        )
    )
    .addTo(map);
