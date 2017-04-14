var xmlHttp;
var departamentos;
var empleados;
var colegas;
var persona;

window.onload = function () {
    onSelect();
    //el listener de cambiar departamento
    document.querySelector("select").addEventListener("change", onChange);
}

//descargamos un fichero .xml
function getXML(uri, asincro = true) {
    xmlHttp = GetXmlHttpObject();
    if (xmlHttp == null) {
        alert("Browser does not support HTTP Request");
        return;
    }
    xmlHttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var xml = xmlHttp.responseXML;
            if (xml.documentElement.tagName == "departamentos") {
                departamentos = xml;
                onSelect();
            }
            else if (xml.documentElement.tagName == "plantilla") {
                empleados = xml;
                onChange();
            }
            else if (xml.documentElement.tagName == "empleado") {
                ponerFoto(xml);
            }
        }
        //si todavia status del evento no es "ready=ya ha cargado" se puede añadir otras funciones
        else {
            //se puede poner imagen "loading"
            if (uri.indexOf("imagenes") >= 0) ponerFoto();
            else if (uri == "departamentos.xml") {}
            else if (uri == "empleados.xml") {}
        }
    };
    xmlHttp.open("GET", uri, asincro);
    xmlHttp.send(null);
}

//obtener el objeto XMLHttpRequest
function GetXmlHttpObject() {
    var objXMLHttp = null;
    if (window.XMLHttpRequest) {
        objXMLHttp = new XMLHttpRequest();
    }
    else if (window.ActiveXObject) {
        objXMLHttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return objXMLHttp;
}

//cargamos departamentos
function onSelect() {
    var selectInput = document.querySelector("select");
    if (!departamentos) {
        getXML("departamentos.xml");
    }
    else if ((selectInput.options.length == 1) && departamentos) {
        var deps = departamentos.getElementsByTagName("departamento");
        for (var i = 0; i < deps.length; i++) {
            selectInput[selectInput.length] = new Option(deps[i].getElementsByTagName("nombre")[0].childNodes[0].nodeValue, deps[i].getAttribute("id"), false, false);
        }
    }
}

//función de eligir departamento 
function onChange() {
    var selectInput = document.querySelector("select");
    if (!empleados) {
        getXML("empleados.xml");
    }
    else if (selectInput.options[selectInput.selectedIndex].value) {
        colegas = [];
        depId = selectInput.options[selectInput.selectedIndex].value;
        var empls = empleados.getElementsByTagName("empleado");
        //listamos todos empleados
        for (var i = 0; i < empls.length; i++) {
            if (empls[i].getAttribute("departamento") == depId) {
                //cogemos los empleados del departamento actual a la lista "colegas"
                colegas.push(empls[i]);
                //mostramos el primer empleado
                if (colegas.length == 1) {
                    persona = empls[i];
                    rellenarHeroe(empls[i]);
                }
            }
        }
        document.getElementById("cantidadColegas").innerHTML = colegas.length;
        if (selectInput.options.length > departamentos.getElementsByTagName("departamento").length) {
            selectInput.options.remove(selectInput.options[0])
        }
    }
}
//mostramos toda la información del empleado
function rellenarHeroe(heroe) {
    persona = heroe;
    var selectInput = document.querySelector("select");
    document.getElementById("numeroHeroe").innerHTML = colegas.indexOf(heroe) + 1;
    document.getElementById("codigo").innerHTML = heroe.getAttribute("id");
    document.getElementById("nombre").innerHTML = heroe.getElementsByTagName("nombre")[0].childNodes[0].nodeValue + " " + heroe.getElementsByTagName("apellidos")[0].childNodes[0].nodeValue;
    document.getElementById("dep").innerHTML = selectInput.options[selectInput.selectedIndex].text;
    document.getElementById("puesto").innerHTML = heroe.getElementsByTagName("puesto")[0].childNodes[0].nodeValue;
    document.getElementById("nivel").innerHTML = heroe.getElementsByTagName("niveleducacion")[0].childNodes[0].nodeValue;
    document.getElementById("sueldo").innerHTML = formatearSueldo(parseInt(heroe.getElementsByTagName("sueldo")[0].getAttribute("base")));
    document.getElementById("complemento").innerHTML = formatearSueldo(parseInt(heroe.getElementsByTagName("sueldo")[0].getAttribute("complemento")));
    //cargar imagen necesita
    getXML("imagenes/" + heroe.getAttribute("id") + ".xml");
    document.getElementById('emp_id').value = "";
}
//poner la imagen del empleado en la página
function ponerFoto(img) {
    foto = document.getElementById("foto");
    if (img) {
        imagen = new Image();
        imagen.src = "imagenes/" + img.getElementsByTagName("imagen")[0].childNodes[0].nodeValue;
        foto.innerHTML = "";
        foto.appendChild(imagen);
    }
    else if (foto.getElementsByTagName("img").length == 0) {
        //imagen = new Image();
        //imagen.src = "imagenes/..."; 
        //se puede poner aquí la imagen "loading"
    }
}
//listar los empleados
function cambiarPagina(num) {
    if (persona) {
        var antiguaPosicion = colegas.indexOf(persona);
        switch (num) {
        case 1:
            if (antiguaPosicion != 0) rellenarHeroe(colegas[0]);
            break;
        case 2:
            if ((antiguaPosicion - 1) >= 0) rellenarHeroe(colegas[antiguaPosicion - 1]);
            break;
        case 3:
            if ((antiguaPosicion + 1) < colegas.length) rellenarHeroe(colegas[antiguaPosicion + 1]);
            break;
        case 4:
            if (antiguaPosicion != colegas.length - 1) rellenarHeroe(colegas[colegas.length - 1]);
            break;
        }
    }
}
//timer para desaparecer el anúncio de error
function myTimer() {
    var d = new Date();
    document.getElementById('ventanilla').style.display = 'none';
}
//listener de tecla "Enter" para input 
function press(ev) {
    if (ev.keyCode === 13) {
        ev.preventDefault();
        mostrarId();
    }
}

function mostrarId(id) {
    var numColega = parseInt(document.getElementById('emp_id').value);
    //no hay número en input
    if (!numColega) {
        document.getElementById('ventanilla').style.display = 'block';
        document.getElementById('ventanilla').innerHTML = 'Mete un número del empleado';
        setTimeout(myTimer, 5000);
        return;
    }
    //error se no existen colegas[] aún
    else if (!colegas) {
        document.getElementById('ventanilla').style.display = 'block';
        document.getElementById('ventanilla').innerHTML = 'Elige un departamento';
        setTimeout(myTimer, 5000);
        return;
    }
    //el número no valido en este departamento
    else if (numColega < 1 || numColega > colegas.length) {
        document.getElementById('ventanilla').style.display = 'block';
        document.getElementById('ventanilla').innerHTML = 'No válido el número del emlpleado';
        setTimeout(myTimer, 5000);
        return;
    }
    //mostramos emlpleado correcto
    else if (numColega >= 1 && numColega <= colegas.length) {
        rellenarHeroe(colegas[numColega - 1]);
        document.getElementById('ventanilla').style.display = 'none';
    }
}
//formatear sueldo
function formatearSueldo(num) {
    return num.toLocaleString('es-ES', {
        style: 'currency'
        , currency: 'EUR'
    });
}