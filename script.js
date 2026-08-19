let cursos = JSON.parse(localStorage.getItem('cursosHorario')) || [];
let idEdicion = null;

const ordenDias = { LUN: 0, MAR: 1, MIE: 2, JUE: 3, VIE: 4, SAB: 5 };
const horasTabla = [];
for (let h = 7; h <= 22; h++) {
    horasTabla.push(`${h}:00`);
    horasTabla.push(`${h}:30`);
}

const colores = ['#3182ce','#38a169','#d69e2e','#e53e3e','#9f7aea','#ed64a6','#f6ad55','#4fd1c5'];

function guardar() {
    localStorage.setItem('cursosHorario', JSON.stringify(cursos));
    renderizarLista();
    renderizarTabla();
}

document.getElementById('formCurso').addEventListener('submit', e => {
    e.preventDefault();
    const curso = {
        id: idEdicion || Date.now(),
        codigo: document.getElementById('codigo').value,
        nombre: document.getElementById('nombre').value,
        profesor: document.getElementById('profesor').value,
        nrc: document.getElementById('nrc').value,
        dia: document.getElementById('dia').value,
        inicio: document.getElementById('inicio').value,
        fin: document.getElementById('fin').value,
        color: colores[Math.floor(Math.random()*colores.length)]
    };

    if (idEdicion) {
        const idx = cursos.findIndex(c => c.id === idEdicion);
        cursos[idx] = curso;
        idEdicion = null;
        document.getElementById('titulo-form').textContent = "➕ Agregar Curso";
        document.getElementById('btnCancelar').classList.add('oculto');
    } else {
        cursos.push(curso);
    }

    e.target.reset();
    guardar();
});

document.getElementById('btnCancelar').addEventListener('click', () => {
    idEdicion = null;
    document.getElementById('formCurso').reset();
    document.getElementById('titulo-form').textContent = "➕ Agregar Curso";
    document.getElementById('btnCancelar').classList.add('oculto');
});

function editarCurso(id) {
    const c = cursos.find(x => x.id === id);
    idEdicion = id;
    document.getElementById('codigo').value = c.codigo;
    document.getElementById('nombre').value = c.nombre;
    document.getElementById('profesor').value = c.profesor;
    document.getElementById('nrc').value = c.nrc;
    document.getElementById('dia').value = c.dia;
    document.getElementById('inicio').value = c.inicio;
    document.getElementById('fin').value = c.fin;
    document.getElementById('titulo-form').textContent = "✏️ Editar Curso";
    document.getElementById('btnCancelar').classList.remove('oculto');
    window.scrollTo({top:0,behavior:'smooth'});
}

function borrarCurso(id) {
    if (confirm('¿Eliminar este curso?')) {
        cursos = cursos.filter(x => x.id !== id);
        guardar();
    }
}

function aMinutos(hora) {
    let t = hora.toUpperCase().replace(/\s/g,'').replace('AM','').replace('PM','');
    let [h,m] = t.split(':').map(Number);
    if (hora.toUpperCase().includes('PM') && h < 12) h += 12;
    if (hora.toUpperCase().includes('AM') && h === 12) h = 0;
    return h*60 + (m||0);
}

function renderizarLista() {
    document.getElementById('contador').textContent = `(${cursos.length})`;
    const lista = document.getElementById('listaCursos');
    lista.innerHTML = '';
    cursos.forEach(c => {
        const div = document.createElement('div');
        div.className = 'curso-tarjeta';
        div.style.borderLeftColor = c.color;
        div.innerHTML = `
            <h3>${c.codigo} — ${c.nombre}</h3>
            <p>👤 ${c.profesor || 'Sin profesor'} | 📌 ${c.nrc || 'Sin NRC'}</p>
            <p>📅 ${c.dia} | ⏰ ${c.inicio} — ${c.fin}</p>
            <div class="botones-accion">
                <button class="btn-editar" onclick="editarCurso(${c.id})">✏️ Editar</button>
                <button class="btn-borrar" onclick="borrarCurso(${c.id})">🗑️ Borrar</button>
            </div>
        `;
        lista.appendChild(div);
    });
}

function renderizarTabla() {
    const cuerpo = document.getElementById('cuerpoTabla');
    cuerpo.innerHTML = '';
    
    horasTabla.forEach(hora => {
        const fila = document.createElement('tr');
        fila.innerHTML = `<td>${hora}</td><td></td><td></td><td></td><td></td><td></td><td></td>`;
        cuerpo.appendChild(fila);
    });

    cursos.forEach(curso => {
        const col = ordenDias[curso.dia] + 1;
        const ini = aMinutos(curso.inicio);
        const fin = aMinutos(curso.fin);
        const filaInicio = Math.floor((ini - 7*60)/30);
        const filasSpan = Math.ceil((fin - ini)/30);

        const fila = cuerpo.children[filaInicio];
        if (!fila) return;
        const celda = fila.children[col];
        celda.rowSpan = filasSpan;
        celda.style.background = curso.color;
        celda.style.color = 'white';
        celda.innerHTML = `<div class="entrada-horario">${curso.codigo}<br>${curso.inicio.slice(0,5)}</div>`;
    });
}

renderizarLista();
renderizarTabla();
