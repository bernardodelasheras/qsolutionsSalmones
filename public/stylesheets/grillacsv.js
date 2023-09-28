$(document).ready(function () {
    $('#grilla').DataTable(
        {
        dom: 'Bfrtip',
        buttons: [
            { extend: 'csv',
              text: 'Excel',
              fieldSeparator: ';' 
            }
            
        ],
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
            paginate: {
                first: "Primero",
                last: "Último",
                next: "Siguiente",
                previous: "Anterior"
            }
        },
        scrollX: true,
        deferRender: true,
        bProcessing: true,
            "initComplete": function (settings, json) {
                $('#divtable').attr('style', 'opacity: 1');
            }

    }
    );
});
