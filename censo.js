let arrayDomiciliosCensados=[];
let arrayPersonas=[];
let cantHabitantesTotal = 0;
let arrayTrabajadoresActivos = [];
let totalRegistrados = 0;
let totalViviendasRegistradas = 0;
let estadisticaPoblacion = [];
let myChartTiposVivienda; 
let graficoTipoVivienda;
let myChartGenero; 
let graficoGenero;
let myChartEdad; 
let graficoEdad;
let myChartTrabajo; 
let graficoTrabajo;
let myChartEducacion; 
let graficoEducacion;
let myChartNivelEducacion; 
let graficoNivelEducacion;


// ******** Incorporo datos externos que luego sumarán a las estadisticas generales ********
    // Viviendas censadas
const viviendasPreRegistradas = "./viviendas.json";  
fetch(viviendasPreRegistradas)
.then(respuesta => respuesta.json())
.then(datos => {
    datos.forEach( vivienda => {
        totalViviendasRegistradas ++;
        totalRegistrados += vivienda.cantidadPersonas;
    })
})
.catch(error => console.log(error))
.finally(() => console.log(`Fin del procesamiento de viviendas pre-registradas. Total:${totalRegistrados} `));

    //Provincias
const comboProvincias = document.getElementById("frmProvincia");
const provincias = "./provincias.json";
fetch(provincias)
.then (respuesta => respuesta.json())
.then (datos=> {
    datos.forEach (provincia => {
        if (provincia.id === "06")
            {comboProvincias.innerHTML += `<option value="${provincia.iso_nombre}" selected>${provincia.iso_nombre}</option>`}
        else 
            {comboProvincias.innerHTML += `<option value="${provincia.iso_nombre}">${provincia.iso_nombre}</option>`}
    })
})
.catch(error => console.log(error))
.finally(() => console.log(`Fin del procesamiento de provincias.`));



// ******** Si localstorage tiene datos, los agrego al array de domicilio, para continuar persistiendolos ********
if (localStorage.getItem("vivienda")){
    let domCensado = JSON.parse (localStorage.getItem("vivienda"));
    for (let i=0; i< domCensado.length; i++){
        arrayDomiciliosCensados.push(domCensado[i]);
    };
}

// ************ DEFINICION DE CLASES ************
class DomicilioCensado {
    constructor (domicilio, ciudad, provincia, tipoVivienda, datosHabitantes) {
        this.domicilio = domicilio;
        this.ciudad = ciudad;
        this.provincia = provincia;
        this.tipoVivienda = tipoVivienda;
        this.datosHabitantes = datosHabitantes; //Es un array de personas censadas en cada domicilio
    }
};

class PersonaCensada {
    constructor (edad, trabajoActivo, genero, jefeHogar, tieneEstudios, nivelEstudio, esJubilado){
        this.edad = edad;
        this.trabajoActivo = trabajoActivo;
        this.genero = genero;
        this.jefeHogar = jefeHogar;
        this.tieneEstudios = tieneEstudios;
        this.nivelEstudio = nivelEstudio;
        this.esJubilado = esJubilado;
    }
};

class TipoVivienda {
    constructor (nombre, cantidad) {
        this.nombre = nombre;
        this.cantidad = cantidad;
    }
}

// ************ FUNCIONES DE HMTL ************

function showHomeScreen(){
    document.getElementById("home").style.display = "block";
    document.getElementById("div_home").style.animation = "fade-in 2s forwards";
    document.getElementById("home_list").style.display = "none";
    document.getElementById("home_new").style.display = "none";
    document.getElementById("home_person_list").style.display = "none";
    document.getElementById("dashboard").style.display = "none";
};

function showHomeList(){
    calcularInfoDelDomicilio();

    const home_list_title = document.getElementById("home_list_title");
    if (arrayDomiciliosCensados.length == 0) {
        home_list_title.innerHTML = `<h3 id="home_list_title" class="d-flex flex-wrap justify-content-left"> No hay viviendas registradas.</h3>`;
    }
    else
        if (arrayDomiciliosCensados.length == 1 ) {
            home_list_title.innerHTML = `<h3 id="home_list_title" class="d-flex flex-wrap justify-content-left">${arrayDomiciliosCensados.length} Vivienda Registrada</h3>`;
        }
        else
            home_list_title.innerHTML = `<h3 id="home_list_title" class="d-flex flex-wrap justify-content-left">${arrayDomiciliosCensados.length} Viviendas Registradas</h3>`;

    document.getElementById("home").style.display = "none";
    document.getElementById("div_home").style.display = "none";
    document.getElementById("home_list").style.display = "block";
    document.getElementById("home_new").style.display = "none";
    document.getElementById("home_person_list").style.display = "none";
    document.getElementById("dashboard").style.display = "none";
}

function showHomeNewScreen(){
    document.getElementById ("frmVivienda").reset();
    document.getElementById("home").style.display = "none";
    document.getElementById("div_home").style.display = "none";
    document.getElementById("home_list").style.display = "none";
    document.getElementById("home_new").style.display = "block";
    document.getElementById("div_home_new").style.animation = "fade-in 2s forwards";
    document.getElementById("home_person_list").style.display = "none";
    document.getElementById("dashboard").style.display = "none";
};

function showPeopleScreen(){
    const tituloPersonas = document.getElementById ("tituloPersonas");
    tituloPersonas.innerHTML = `<h2 id="tituloPersonas" class=" d-flex flex-wrap justify-content-left">Agregar personas del domicilio: ${document.getElementById ("frmDomicilio").value} </h2>`;
    document.getElementById("home").style.display = "none";
    document.getElementById("home_list").style.display = "none";
    document.getElementById("home_new").style.display = "none";
    document.getElementById("home_person_list").style.display = "block";
    document.getElementById("div_home_person_list").style.animation = "fade-in 2s forwards";
    document.getElementById("dashboard").style.display = "none";
};

function showDashboardScreen(){
    document.getElementById("home").style.display = "none";
    document.getElementById("div_home").style.display = "none";
    document.getElementById("home_list").style.display = "none";
    document.getElementById("home_new").style.display = "none";
    document.getElementById("home_person_list").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("div_dashboard").style.animation = "fade-in 2s forwards";
};


showHomeScreen();


// ************ OTRAS FUNCIONES ************

function actualizarPersonasEnDomicilio() {
    const frmDomicilio = document.getElementById ("frmDomicilio").value;
    const frmCiudad = document.getElementById ("frmCiudad").value;
    const frmProvincia = document.getElementById ("frmProvincia").value;
    const frmTipoVivienda = document.getElementById ("frmTipoVivienda").value;

    //Creo un nuevo objeto con el domicilio y su array de habitantes 
    const domicilioCensado = new DomicilioCensado(frmDomicilio, frmCiudad, frmProvincia,frmTipoVivienda, arrayPersonas );
    
    //Actualizo la ultima posicion del array con el nuevo objeto domicilioCensado, que ahora esta completo
    arrayDomiciliosCensados[arrayDomiciliosCensados.length-1] = domicilioCensado;

}

function calcularInfoDelDomicilio(){
    //Calculo los cards que muestran los domicilios que se van registrando
    let arrayTrabajadoresActivosCadaDomicilio = [];

    const infoViviendas = document.getElementById ("infoViviendas");
    infoViviendas.innerHTML = "";
    let idDomicilio=0;

    for (const domicilio of arrayDomiciliosCensados) {
        let {domicilio: calle, ciudad, provincia} = domicilio;
        let domicilioCompleto = `${calle} - ${ciudad} - ${provincia}`;

        arrayTrabajadoresActivosCadaDomicilio = domicilio.datosHabitantes.filter (persona => persona.trabajoActivo);    
        arrayTrabajadoresActivos = arrayTrabajadoresActivos.concat (arrayTrabajadoresActivosCadaDomicilio);

        let cantMayores= 0;
        let cantMenores=0;

        for (let i = 0; i < domicilio.datosHabitantes.length; i++){
            domicilio.datosHabitantes[i].edad >= 21 ? cantMayores++ : cantMenores++;
        };
       
        infoViviendas.innerHTML += `<div class="col-md-3 col-sm-12  ">
                                        <div class="card justify-content-center">
                                        <div class="card-body">
                                            <h5 class="card-title">${domicilioCompleto}</h5>
                                            <h7 class="card-subtitle mb-2 text-muted">${domicilio.tipoVivienda}</h7>
                                            <ul class="list-group list-group-flush">
                                            <li class="list-group-item">${domicilio.datosHabitantes.length} habitantes</li>
                                            <li class="list-group-item">${cantMayores} mayores de edad</li>
                                            <li class="list-group-item">${cantMenores} menores</li>
                                            <li class="list-group-item"><button id="btnEliminarVivienda_${idDomicilio}" onclick="eliminarVivienda(${idDomicilio})" type="button" class="btn btn-danger ">Eliminar</button> </li>
                                            </ul>
                                        </div>
                                        </div>
                                    </div>`;

        idDomicilio++;
    }
}

function mostrarConfirmacion(mensaje){
    //Mostrar mensaje de confirmacion de ingreso de datos
    Toastify({
        text: mensaje,
        duration: 2500,
        close: true,
        gravity: "bottom",
        position: "center",
        style: {
            background: '#17A589'
          },
        className: "info"
    }).showToast();

}

function calcularTiposVivienda(){
    //Genera los calculos para mostrar estadisticas sobre los tipos de vivienda
    let cantCasa=0;
    let cantDepto=0;
    let cantRancho=0;
    let cantOtro=0;
    let cantNoDefinido=0;

    arrayDomiciliosCensados.forEach(vivienda => {
        switch (vivienda.tipoVivienda) {
            case "Casa":
                cantCasa++;
                break;
            case "Departamento":
                cantDepto++;
                break;
            case "Rancho":
                cantRancho++;
                break;
            case "Otro":
                cantOtro++;
                break;
            default:
                cantNoDefinido++;
                break;
        }
    });

    const arrayTiposVivienda = [cantCasa, cantDepto, cantRancho, cantOtro, cantNoDefinido];
    return arrayTiposVivienda;
}


function calcularDatosPoblacion(){
    //Calcula info estadistica de poblacion para mostrar en graficos

    let arrayGenero = [0,0,0,0];    //F - M - Otro - No definido
    let arrayEdad = [0,0,0,0,0,0];  //0 a 11 - 12 a 18 - 19 a 30 - 31 a 60 - +60 - no definido
    let arrayTrabajo = [0,0,0];     //Trabajan en la actualidad - No trabajan - Son jubilados/pensionados
    let arrayEducacion = [0,0];     //Estudian - No estudian
    let arrayNivelEducacion = [0,0,0,0,0,0,0];     //Ninguno - Jardin - Primario - Secundario - Terciario - Universitario - Postgrado
    
    arrayDomiciliosCensados.forEach(vivienda => {
        vivienda.datosHabitantes.forEach(persona => {
            arrayGenero = sumarizarGenero (persona.genero, arrayGenero);    
            arrayEdad = sumarizarEdad (persona.edad, arrayEdad);   
            arrayTrabajo = sumarizarTrabajo (persona.trabajoActivo, persona.esJubilado, arrayTrabajo); 
            arrayEducacion = sumarizarEducacion (persona.tieneEstudios, arrayEducacion);
            arrayNivelEducacion = sumarizarNivelEducacion (persona.nivelEstudio,arrayNivelEducacion);
        });
    });

    const arrayPoblacion = [arrayGenero, arrayEdad, arrayTrabajo, arrayEducacion, arrayNivelEducacion]; 
    return arrayPoblacion;
}

function sumarizarGenero (genero, arrayGenero) {
    //Calcula la info estadistica sobre genero
    switch (genero) {
        case "F":
            arrayGenero[0]++;
            break;
        case "M":
            arrayGenero[1]++;
            break;
        case "X":
            arrayGenero[2]++;
            break;
        default:
            arrayGenero[3]++;
            break;
    }
    return arrayGenero;
}

function sumarizarEdad (edad, arrayEdad) {
    //Calcula la info estadistica sobre edad

    if (edad >= 0 && edad <=11) {
        arrayEdad[0]++;
    }
    else if (edad >= 12 && edad <=18){
        arrayEdad[1]++;
    }
    else if (edad >= 19 && edad <= 30){
        arrayEdad[2]++;
    }
    else if (edad >= 31 && edad <=60){
        arrayEdad[3]++;
    }
    else if (edad >= 60) {
        arrayEdad[4]++;
    }
    else
        arrayEdad[5]++;
    return arrayEdad;
}

function sumarizarTrabajo (esTrabajador, esJubilado, arrayTrabajo) {
    //Calcula la info estadistica sobre actividad economica (trabajadores y jubilados)
    esTrabajador == true ? arrayTrabajo[0]++ : arrayTrabajo[1]++;
    esJubilado == true  && arrayTrabajo[2]++;
    return arrayTrabajo;
}

function sumarizarEducacion (esEstudiante, arrayEducacion) {
    //Calcula la info estadistica sobre personas que estudian o han estudiado
    esEstudiante == true ? arrayEducacion[0]++ : arrayEducacion[1]++;
    return arrayEducacion;
}

function sumarizarNivelEducacion (nivelEstudio, arrayNivelEducacion) {
    //Calcula la info estadistica sobre nivel academico alcanzado
    switch (nivelEstudio) {
        case "Ninguno":
            arrayNivelEducacion[0]++;
            break;
        case "Jardin":
            arrayNivelEducacion[1]++;
            break;
        case "Primario":
            arrayNivelEducacion[2]++;
            break;
        case "Secundario":
            arrayNivelEducacion[3]++;
            break;    
        case "Terciario":
            arrayNivelEducacion[4]++;
            break;
        case "Universitario":
            arrayNivelEducacion[5]++;
            break;
        case "Postgrado":
            arrayNivelEducacion[6]++;
            break;
    }
    return arrayNivelEducacion;
}



function calcularEstadisticas(){
    //Calculo totales - Le sumo tambien la info que surge del archivo externo, para mostrar estadisticas completas (esto no aplica a los graficos)
    const totalPoblacion = document.getElementById ("totalPoblacion");
    const totalFinalPoblacion = cantHabitantesTotal + totalRegistrados;
    totalPoblacion.innerHTML = `<p id="totalPoblacion" class="card-title_number  text-center">${totalFinalPoblacion}</p>`;

    const totalDomicilios = document.getElementById ("totalDomicilios");
    const totalFinalViviendas = arrayDomiciliosCensados.length + totalViviendasRegistradas;
    totalDomicilios.innerHTML = `<p id="totalDomicilios" class="card-title_number  text-center">${totalFinalViviendas}</p>`;

    //Devuelve un array con los datos estadisticos de la poblacion censada
    estadisticaPoblacion = calcularDatosPoblacion(); 

};

function configurarGraficos () {
    configurarGraficoTipoViv();     //Segun Tipos de vivienda
    configurarGraficoGenero();      //Distribucion Por Genero
    configurarGraficoEdad();        //Distribucion Por Edad
    configurarGraficoTrabajo();     //Distribucion Por Trabajo
    configurarGraficoEducacion();   //Distribucion Por Educacion
    configurarGraficoNivelEducacion();  //Distribucion por Nivel academico
};

function configurarGraficoTipoViv (){
    const arrayTiposVivienda = calcularTiposVivienda();
    
    const config = {
            type: 'doughnut',
            data:{
                labels: [
                  'Casa',
                  'Departamento',
                  'Rancho/Casilla',
                  'Otro',
                  'No definido'
                ],
                datasets: [{
                  label: 'Tipos de Vivienda',
                  data: arrayTiposVivienda,
                  backgroundColor: [
                    '#ffbe0b',
                    '#fb5607',
                    '#ff006e',
                    '#8338ec',
                    '#3a86ff'
                  ],
                  hoverOffset: 4
                }]
              }
          };
   
       graficoTipoVivienda = document.getElementById("graficoTipoVivienda").getContext("2d");
       destruirGrafico (myChartTiposVivienda);
       myChartTiposVivienda = new Chart(graficoTipoVivienda,config);
   
}

function configurarGraficoGenero(){
    //Obtiene solo los datos de genero que corresponden a la posicion 0 del array general de poblacion
    const arrayCantGenero = estadisticaPoblacion[0];

    const configG = {
        type: 'doughnut',
        data:{
            labels: [
              'Femenino',
              'Masculino',
              'Otro',
              'No definido'
            ],
            datasets: [{
              label: 'Distribucion de población por género',
              data: arrayCantGenero,
              backgroundColor: [
                '#ffbe0b',
                '#ff006e',
                '#8338ec',
                '#3a86ff'
              ]
            }]
          }
      };

   graficoGenero = document.getElementById("graficoGenero").getContext("2d");
   destruirGrafico (myChartGenero);
   myChartGenero = new Chart(graficoGenero,configG);

}


function configurarGraficoEdad(){
    //Obtiene solo los datos de edad que corresponden a la posicion 1 del array general de poblacion
    const arrayCantEdad = estadisticaPoblacion[1]; 

    const configE = {
        type: 'bar',
        data:{
            labels: [
              '0-11 años',
              '12-18 años',
              '19-30 años',
              '31-60 años',
              '+ 60 años',
              'No definido'
            ],
            datasets: [{
              label: 'Rangos etarios',
              data: arrayCantEdad,
              backgroundColor: [
                '#ffbe0b',
                '#ff006e',
                '#8338ec',
                '#3a86ff',
                '#006d77',
                '#83c5be'
              ],
              borderWidth: 1
            }]
          },
        options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
      };

   graficoEdad = document.getElementById("graficoEdad").getContext("2d");
   destruirGrafico (myChartEdad);
   myChartEdad = new Chart(graficoEdad,configE);

}


function configurarGraficoTrabajo(){
    //Obtiene solo los datos de trabajo que corresponden a la posicion 2 del array general de poblacion
    const arrayCantTrabajo = estadisticaPoblacion[2]; 
    const configT = {
        type: 'pie',
        data:{
            labels: [
              'Trabajan actualmente',
              'No trabajan',
              'Son jubilados/pensionados'
            ],
            datasets: [{
              label: 'Actividad laboral',
              data: arrayCantTrabajo,
              backgroundColor: [
                '#ff006e',
                '#8338ec',
                '#3a86ff'
              ]
            }]
          }
      }

   graficoTrabajo = document.getElementById("graficoTrabajo").getContext("2d");
   destruirGrafico (myChartTrabajo);
   myChartTrabajo = new Chart(graficoTrabajo,configT);

}

function configurarGraficoEducacion(){
    //Obtiene solo los datos de educacion que corresponden a la posicion 3 del array general de poblacion
    const arrayCantEducacion = estadisticaPoblacion[3]; 
    const configE = {
        type: 'pie',
        data:{
            labels: [
              'Con algun nivel de estudios',
              'Sin estudios'
            ],
            datasets: [{
              label: 'Educacion',
              data: arrayCantEducacion,
              backgroundColor: [
                '#8338ec',
                '#3a86ff'
              ]
            }]
          }
      }

   graficoEducacion = document.getElementById("graficoEducacion").getContext("2d");
   destruirGrafico (myChartEducacion);
   myChartEducacion = new Chart(graficoEducacion,configE);

}

function configurarGraficoNivelEducacion(){
    //Obtiene solo los datos de edad que corresponden a la posicion 4 del array general de poblacion
    const arrayCantNivel= estadisticaPoblacion[4]; 

    const configE = {
        type: 'bar',
        data:{
            labels: [
              'Ninguno',
              'Jardín',
              'Primario',
              'Secundario',
              'Terciario',
              'Universitario',
              'Postgrado'
            ],
            datasets: [{
              label: 'Nivel académico alcanzado',
              data: arrayCantNivel,
              backgroundColor: [
                '#ffbe0b',
                '#ff006e',
                '#8338ec',
                '#3a86ff',
                '#006d77',
                '#83c5be',
                '#00f5d4'
              ],
              borderWidth: 1
            }]
          },
        options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
      };

   graficoNivelEducacion = document.getElementById("graficoNivelEducacion").getContext("2d");
   destruirGrafico (myChartNivelEducacion);
   myChartNivelEducacion = new Chart(graficoNivelEducacion,configE);

}


function destruirGrafico (grafico) {
    if (grafico != undefined) {
        grafico.destroy();
        }   
}


// ******* EVENTOS del formulario ********

const btnNewHouse = document.getElementById ("btnNewHouse");
btnNewHouse.onclick = (e) => {
    e.preventDefault();
   showHomeNewScreen();
};

const btnNewHouseFromList = document.getElementById ("btnNewHouseFromList");
btnNewHouseFromList.onclick = (e) => {
    e.preventDefault();
   showHomeNewScreen();
};


const btnAddHouse = document.getElementById ("btnAddHouse");
btnAddHouse.onclick = (e) => {
    e.preventDefault();

    const domicilio = document.getElementById ("frmDomicilio").value;
    const ciudad = document.getElementById ("frmCiudad").value;
    const provincia = document.getElementById ("frmProvincia").value;
    const tipoVivienda = document.getElementById ("frmTipoVivienda").value;
    let miArrayPersonas = [];

    const domicilioCensado = new DomicilioCensado(domicilio, ciudad, provincia, tipoVivienda, miArrayPersonas);
    
    arrayDomiciliosCensados.push (domicilioCensado);
    arrayPersonas=[];

    showPeopleScreen();
};

const btnAddPersonToHouse = document.getElementById ("btnAddPersonToHouse");
btnAddPersonToHouse.onclick = (e) => {
    e.preventDefault();

    const jefeHogar = document.getElementById ("frmJefe").checked;
    const edad = document.getElementById ("frmEdad").value;

    const genero  = document.getElementsByName ("genero");
    let generoElegido="";

    for (let i = 0; i <  genero.length; i++) {
        if (genero[i].checked) {
             generoElegido = genero[i].value;
        break;
        }
    }

    const trabaja = document.getElementById ("frmTrabaja").checked;
    const esJubilado = document.getElementById ("frmJubilado").checked;

    const tieneEstudios = document.getElementById ("frmEstudio").checked;
    const nivelEstudio = document.getElementById ("frmNivelEstudio").value;

    const persona = new PersonaCensada (edad, trabaja, generoElegido, jefeHogar, tieneEstudios, nivelEstudio, esJubilado);
    arrayPersonas.push (persona);

    mostrarConfirmacion("Persona registrada correctamente");

    document.getElementById("frmPersona").reset();    
    
};


const btnFinishHouse = document.getElementById ("btnFinishHouse");
btnFinishHouse.onclick = (e) => {
    e.preventDefault();

    actualizarPersonasEnDomicilio();

    cantHabitantesTotal = arrayDomiciliosCensados.reduce((acumulador, elemento) => acumulador + elemento.datosHabitantes.length,0 );
    arrayTrabajadoresActivos = [];

    calcularInfoDelDomicilio();
    mostrarConfirmacion("Vivienda registrada correctamente");

    //Agregar el dato al localstorage
    localStorage.setItem ("vivienda", JSON.stringify(arrayDomiciliosCensados));
    showHomeList();
    
};


const menuDashboard = document.getElementById ("menu_dashboard");
menuDashboard.onclick = (e) => {
    e.preventDefault();

    calcularEstadisticas();
    configurarGraficos ();
    showDashboardScreen();
    
};

const menuHome = document.getElementById ("menu_home");
menuHome.onclick = (e) =>{
    e.preventDefault();
    showHomeList();
}


function eliminarVivienda (idArray){
    //Elimino el domicilio del array general de domicilios
    arrayDomiciliosCensados.splice(idArray,1);

    //Sobreescribo el localstorage con el nuevo array de domicilios, por la eliminacion de una vivienda
    localStorage.setItem ("vivienda", JSON.stringify(arrayDomiciliosCensados));

    //Recalculo la cantidad de poblacion total, por la eliminacion de una vivienda
    cantHabitantesTotal = arrayDomiciliosCensados.reduce((acumulador, elemento) => acumulador + elemento.datosHabitantes.length,0 );

    showHomeList()
}
    
