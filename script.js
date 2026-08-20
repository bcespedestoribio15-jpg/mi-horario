// 📂 BIBLIOTECA: Cursos con sus opciones múltiples
let biblioteca = JSON.parse(localStorage.getItem('bibliotecaCursos')) || [];
// ✅ Selección actual para armar horario
let seleccion = {};
// 🔑 Curso que se está editando en este momento
let cursoActivoId = null;

// ⏱️ BLOQUES DE HORA UNIVERSITARIA (45 min + 5 min cambio)
const horasTabla = [
  "7:00", "7:50", "8:45", "9:40", "10:35", "11:30", "12:25",
  "1:20", "2:15", "3:10", "4:05", "5:00", "5:55",
  "6:50", "7:45", "8:40", "9:35"
];
const bloquesHora = {
    "7:00":0,"7:50":1,"8:45":2,"9:40":3,"10:35":4,"11:30":5,"12:25":6,
    "1:20":7,"2:15":8,"3:10":9,"4:05":10,"5:00":11,"5:55":12,
    "6:50":13,"7:45":14,"8:40":15,"9:35":16
};
const ordenDias = { LUN:0, MAR:1, MIE:2, JUE:3, VIE:4, SAB:5 };
const colores = ['#3182ce','#38a169','#d69e2e','#e53e3e','#9f7aea','#ed64a6','#f6ad55','#4fd1c5'];

// 💾 GUARDAR TODO automáticamente
function guardarBiblioteca() {
    localStorage.setItem('bibliotecaCursos', JSON.stringify(biblioteca));
    renderizarBiblioteca();
    renderizarTabla();
}

// 📝 AGREGAR CURSO NUEVO
document.getElementById('formCurso').addEventListener('submit', e => {
    e.preventDefault();
    cursoActivoId = Date.now();
    const nuevoCurso = {
        id: cursoActivoId,
        codigo: document.getElementById('codigo').value,
        nombre: document.getElementById('nombreCurso').value,
        color: colores[Math.floor(Math.random()*colores.length)],
        opciones: []
    };
    biblioteca.push(nuevoCurso);
    guardarBiblioteca();
    
    // Mostrar panel para agregar opciones
    document.getElementById('formCurso').classList.add('oculto');
    document.getElementById('panelOpciones').classList.remove('oculto');
    document.getElementById('nombreCursoActivo').textContent = nuevoCurso.codigo + " — " + nuevoCurso.nombre;
    document.getElementById('tituloForm').textContent = "✅ Curso creado: agrega sus opciones";
    e.target.reset();
});

// ➕ AGREGAR OPCIÓN AL CURSO ACTIVO
document.getElementById('formOpcion').addEventListener('submit', e => {
    e.preventDefault();
    const opcion = {
        id: Date.now(),
        profesor: document.getElementById('profesor').value || "Sin profe",
        nrc: document.getElementById('nrc').value || "—",
        dia: document.getElementById('dia').value,
        inicio: document.getElementById('inicio').value,
        fin: document.getElementById('fin').value
    };
    
    const curso = biblioteca.find(c => c.id === cursoActivoId);
    curso.opciones.push(opcion);
    guardarBiblioteca();
    renderizarOpcionesCursoActivo();
    e.target.reset();
});

// ✅ CERRAR EDICIÓN DEL CURSO
document.getElementById('btnCerrarCurso').addEventListener('click', () => {
    cursoActivoId = null;
    document.getElementById('panelOpciones').classList.add('oculto');
    document.getElementById('formCurso').classList.remove('oculto');
    document.getElementById('tituloForm').textContent = "➕ Agregar Curso Nuevo";
});

// 📋 Mostrar opciones del curso que se está agregando
function renderizarOpcionesCursoActivo() {
    const curso = biblioteca.find(c => c.id === cursoActivoId);
    const contenedor = document.getElementById('listaOpcionesCurso');
    contenedor.innerHTML = "<p style='margin-top:8px;color:#38a169;'>✅ " + curso.opciones.length + " opción(es) agregada(s)</p>";
}

// 📚 BIBLIOTECA COMPLETA: lista cursos con opciones para elegir
function renderizarBiblioteca() {
    const contenedor = document.getElementById('listaBiblioteca');
    contenedor.innerHTML = '';
    
    biblioteca.forEach(curso => {
        const div = document.createElement('div');
        div.className = 'curso-bloque';
        div.style.borderLeft = `4px solid ${curso.color}`;
        
        let opcionesHTML = '';
        curso.opciones.forEach(op => {
            const sel = seleccion[curso.id]?.id === op.id;
            const choque = verificarChoque(curso, op);
            opcionesHTML += `
                <div class="opcion-radio ${sel?'seleccionada':''} ${choque?'choque':''}" 
                     onclick="seleccionarOpcion(${curso.id}, ${op.id})">
                    <strong>${op.nrc}</strong> | ${op.profesor}<br>
                    📅 ${op.dia} | ⏰ ${op.inicio} — ${op.fin}
                    ${choque?'<br>⚠️ <strong>¡CHOQUE DETECTADO!</strong>':''}
                </div>
            `;
        });

        div.innerHTML = `
            <h3>
                <span>${curso.codigo} — ${curso.nombre}</span>
                <span>
                    <button class="btn-borrar-sm" onclick="borrarCurso(${curso.id})">🗑️</button>
                </span>
            </h3>
            ${curso.opciones.length === 0 ? '<p style="font-size:12px;color:#a0aec0">Edita este curso para agregar opciones</p>' : opcionesHTML}
        `;
        contenedor.appendChild(div);
    });

    actualizarAlertaChoques();
}

// ✅ SELECCIONAR UNA OPCIÓN
function seleccionarOpcion(cursoId, opcionId) {
    const curso = biblioteca.find(c => c.id === cursoId);
    const opcion = curso.opciones.find(o => o.id === opcionId);
    
    // Si ya estaba seleccionada → la deselecciona
    if (seleccion[cursoId]?.id === opcionId) {
        delete seleccion[cursoId];
    } else {
        seleccion[cursoId] = { ...opcion, codigo: curso.codigo, nombre: curso.nombre, color: curso.color };
    }
    
    guardarBiblioteca();
}

// ⚠️ VERIFICAR CHOQUES DE HORARIO
function verificarChoque(cursoNuevo, opcionNueva) {
    const diaN = opcionNueva.dia;
    const iniN = bloquesHora[opcionNueva.inicio];
    const finN = bloquesHora[opcionNueva.fin];
    
    for (const cid in seleccion) {
        if (Number(cid) === cursoNuevo.id) continue;
        const sel = seleccion[cid];
        if (sel.dia !== diaN) continue;
        const iniS = bloquesHora[sel.inicio];
        const finS = bloquesHora[sel.fin];
        // Si se traslapan los bloques → hay choque
        if (!(finN < iniS || finS < iniN)) return true;
    }
    return false;
}

function actualizarAlertaChoques() {
    const alerta = document.getElementById('alertaChoques');
    let mensajes = [];
    
    for (const cid in seleccion) {
        for (const cid2 in seleccion) {
            if (cid >= cid2) continue;
            const a = seleccion[cid], b = seleccion[cid2];
            if (a.dia === b.dia) {
                const inA = bloquesHora[a.inicio], fiA = bloquesHora[a.fin];
                const inB = bloquesHora[b.inicio], fiB = bloquesHora[b.fin];
                if (!(fiA < inB || fiB < inA)) {
                    mensajes.push(`⚠️ <strong>${a.codigo}</strong> choca con <strong>${b.codigo}</strong> el ${a.dia} entre ${a.inicio} y ${a.fin}`);
                }
            }
        }
    }
    
    if (mensajes.length > 0) {
        alerta.classList.remove('oculto');
        alerta.innerHTML = mensajes.join('<br>');
    } else {
        alerta.classList.add('oculto');
    }
}

// 🗑️ BORRAR CURSO COMPLETO
function borrarCurso(id) {
    if (confirm('¿Eliminar este curso y todas sus opciones?')) {
        biblioteca = biblioteca.filter(c => c.id !== id);
        delete seleccion[id];
        guardarBiblioteca();
    }
}

// 📆 DIBUJAR TABLA DEL HORARIO ARMADO
function renderizarTabla() {
    const cuerpo = document.getElementById('cuerpoTabla');
    cuerpo.innerHTML = '';
    
    horasTabla.forEach(hora => {
        const fila = document.createElement('tr');
        fila.innerHTML = `<td><strong>${hora}</strong></td><td></td><td></td><td></td><td></td><td></td><td></td>`;
        cuerpo.appendChild(fila);
    });

    // Colocar cada curso seleccionado
    for (const cid in seleccion) {
        const op = seleccion[cid];
        const col = ordenDias[op.dia] + 1;
        const filaInicio = bloquesHora[op.inicio];
        const filaFin = bloquesHora[op.fin];
        const span = Math.max(1, filaFin - filaInicio + 1);

        const fila = cuerpo.children[filaInicio];
        if (!fila) continue;
        const celda = fila.children[col];
        celda.rowSpan = span;
        celda.style.background = op.color;
        celda.style.color = 'white';
        celda.style.padding = '4px';
        celda.style.fontSize = '11px';
        celda.innerHTML = `<strong>${op.codigo}</strong><br>${op.inicio}-${op.fin}`;
    }
}

// 📄 DESCARGAR EN PDF
document.getElementById('btnDescargarPDF').addEventListener('click', () => {
    const elemento = document.getElementById('areaPDF');
    const opciones = {
        margin: 10,
        filename: 'Horario-Universidad.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opciones).from(elemento).save();
});

// 🚀 INICIAR TODO
renderizarBiblioteca();
renderizarTabla();
console.log('✅ ¡Sistema listo! Cursos con opciones + Choques + PDF');
