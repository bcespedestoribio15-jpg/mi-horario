// 📂 BIBLIOTECA: Cursos con sus opciones múltiples
let biblioteca = JSON.parse(localStorage.getItem('bibliotecaCursos')) || [];
let seleccion = {};
let cursoActivoId = null;

// 🎨 PALETA DE COLORES ÚNICOS POR CURSO
const colores = [
    '#3182ce','#38a169','#d69e2e','#e53e3e','#9f7aea','#ed64a6',
    '#4fd1c5','#2d3748','#805ad5','#f6ad55','#2f855a','#2b6cb0',
    '#c53030','#b7791f','#2c5282','#1a365d','#234e52','#285e61'
];

// ⏱️ HORARIOS HASTA LAS 10:30 PM
const horasTabla = [
  "7:00", "7:50", "8:45", "9:40", "10:35", "11:30", "12:25",
  "1:20", "2:15", "3:10", "4:05", "5:00", "5:55",
  "6:50", "7:45", "8:40", "9:35", "10:30"
];
const bloquesHora = {
    "7:00":0,"7:50":1,"8:45":2,"9:40":3,"10:35":4,"11:30":5,"12:25":6,
    "1:20":7,"2:15":8,"3:10":9,"4:05":10,"5:00":11,"5:55":12,
    "6:50":13,"7:45":14,"8:40":15,"9:35":16,"10:30":17
};
const ordenDias = { LUN:0, MAR:1, MIE:2, JUE:3, VIE:4, SAB:5 };

// 💾 GUARDAR Y ACTUALIZAR TODO
function guardarBiblioteca() {
    localStorage.setItem('bibliotecaCursos', JSON.stringify(biblioteca));
    renderizarBiblioteca();
    renderizarTabla(); // 🔴 AQUÍ: Se actualiza la tabla SIEMPRE al guardar
}

// 📝 AGREGAR CURSO NUEVO → COLOR ÚNICO
document.getElementById('formCurso').addEventListener('submit', e => {
    e.preventDefault();
    cursoActivoId = Date.now();
    const colorAsignado = colores[biblioteca.length % colores.length];
    const nuevoCurso = {
        id: cursoActivoId,
        codigo: document.getElementById('codigo').value,
        nombre: document.getElementById('nombreCurso').value,
        color: colorAsignado,
        opciones: []
    };
    biblioteca.push(nuevoCurso);
    guardarBiblioteca();
    
    document.getElementById('formCurso').classList.add('oculto');
    document.getElementById('panelOpciones').classList.remove('oculto');
    document.getElementById('nombreCursoActivo').textContent = nuevoCurso.codigo + " — " + nuevoCurso.nombre;
    document.getElementById('tituloForm').textContent = "✅ Curso creado: agrega sus opciones";
    e.target.reset();
});

// ➕ AGREGAR OPCIÓN
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

// ✅ CERRAR EDICIÓN
document.getElementById('btnCerrarCurso').addEventListener('click', () => {
    cursoActivoId = null;
    document.getElementById('panelOpciones').classList.add('oculto');
    document.getElementById('formCurso').classList.remove('oculto');
    document.getElementById('tituloForm').textContent = "➕ Agregar Curso Nuevo";
});

function renderizarOpcionesCursoActivo() {
    const curso = biblioteca.find(c => c.id === cursoActivoId);
    const contenedor = document.getElementById('listaOpcionesCurso');
    contenedor.innerHTML = "<p style='margin-top:8px;color:#38a169;'>✅ " + curso.opciones.length + " opción(es) agregada(s)</p>";
}

// 📚 BIBLIOTECA
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

// ✅ SELECCIONAR OPCIÓN → DEBE ACTUALIZAR LA TABLA
function seleccionarOpcion(cursoId, opcionId) {
    const curso = biblioteca.find(c => c.id === cursoId);
    const opcion = curso.opciones.find(o => o.id === opcionId);
    
    // Si ya estaba seleccionada → deselecciona
    if (seleccion[cursoId] && seleccion[cursoId].id === opcionId) {
        delete seleccion[cursoId];
    } else {
        // Selecciona la nueva opción
        seleccion[cursoId] = { 
            id: opcion.id,
            codigo: curso.codigo, 
            nombre: curso.nombre, 
            color: curso.color,
            profesor: opcion.profesor,
            nrc: opcion.nrc,
            dia: opcion.dia,
            inicio: opcion.inicio,
            fin: opcion.fin
        };
    }
    
    // 🔴 IMPORTANTE: Esto refresca TODO al hacer clic
    renderizarBiblioteca();
    renderizarTabla();
}

// ⚠️ VERIFICAR CHOQUES
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

// 🗑️ BORRAR CURSO
function borrarCurso(id) {
    if (confirm('¿Eliminar este curso y todas sus opciones?')) {
        biblioteca = biblioteca.filter(c => c.id !== id);
        delete seleccion[id];
        guardarBiblioteca();
    }
}

// 📆 DIBUJAR LA TABLA DE HORARIO
function renderizarTabla() {
    const cuerpo = document.getElementById('cuerpoTabla');
    if (!cuerpo) return; // Evita errores si no existe
    
    cuerpo.innerHTML = '';
    
    // Crea las filas con las horas
    horasTabla.forEach(hora => {
        const fila = document.createElement('tr');
        fila.innerHTML = `<td><strong>${hora}</strong></td><td></td><td></td><td></td><td></td><td></td><td></td>`;
        cuerpo.appendChild(fila);
    });

    // Dibuja cada curso seleccionado
    for (const cid in seleccion) {
        const op = seleccion[cid];
        const col = ordenDias[op.dia] + 1;
        const filaInicio = bloquesHora[op.inicio];
        const filaFin = bloquesHora[op.fin];
        const span = Math.max(1, filaFin - filaInicio + 1);

        if (filaInicio === undefined || !cuerpo.children[filaInicio]) continue;
        
        const fila = cuerpo.children[filaInicio];
        const celda = fila.children[col];
        celda.rowSpan = span;
        celda.style.background = op.color;
        celda.style.color = 'white';
        celda.style.padding = '3px';
        celda.style.fontSize = '10px';
        celda.innerHTML = `<strong>${op.codigo}</strong><br>${op.inicio}`;
    }
}

// 📄 DESCARGAR EN PDF UNA SOLA PÁGINA
document.getElementById('btnDescargarPDF').addEventListener('click', () => {
    const elemento = document.getElementById('areaPDF');
    const opciones = {
        margin: 5,
        filename: 'Horario-Universidad.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 1.6 },
        jsPDF: { unit: 'mm', format: 'a3', orientation: 'landscape', compress: true },
        pagebreak: { mode: 'avoid-all' }
    };
    html2pdf().set(opciones).from(elemento).save();
});

// 🚀 INICIAR TODO
renderizarBiblioteca();
renderizarTabla();
console.log('✅ Sistema listo: selección dibuja en la tabla + horario 10:30 + PDF 1 página + colores únicos');
