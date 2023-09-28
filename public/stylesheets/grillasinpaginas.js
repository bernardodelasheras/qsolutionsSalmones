$(document).ready(function () {
    $('#grillasimple').DataTable(
    {
        "order": [],
        language: {
            processing: "Procesando...",
            lengthMenu: "Mostrar _MENU_ registros",
            zeroRecords: "No se encontraron resultados",
            emptyTable: "Ningún dato disponible en esta tabla",
            info: "Del _START_ al _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
            infoFiltered: "(filtrado de un total de _MAX_ registros)",
            infoPostFix: "",
            search: "Buscar:",
            url: "",
            infoThousands: ",",
            loadingRecords: "Cargando...",
        },
        "paging": false,
        "scrollY": "250px",
        "scrollCollapse": true,
    }
    );
});
