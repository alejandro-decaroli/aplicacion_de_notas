import { exit } from '@tauri-apps/plugin-process';
import { ask, message } from '@tauri-apps/plugin-dialog';
import { create, exists, open, mkdir, readDir, readFile, remove } from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';

let exitButtonEl: HTMLButtonElement | null;
let backButtonEl: HTMLButtonElement | null;
let noteFormEl: HTMLFormElement | null;
let noteName: HTMLInputElement | null;
let noteContent: HTMLTextAreaElement | null;
let createNoteButtonEl: HTMLButtonElement | null;
let viewNoteButtonEl: HTMLButtonElement | null;
let tableBody: HTMLTableElement | null;
let baseDir: string;
let note_path: string = ""
let note_name: string = ""

// Funcion para salir
async function goodBye() {
  let result = await ask("¿Estás seguro de querer salir?");
  if (result) {
    exit();
  }
}

// Funcion para volver atras
function back() {
    window.location.href = "../index.html";
}

// Funcion para obtener las notas
async function getNotes() {
    try {
        baseDir = await path.documentDir() + "/notes";
        if (!await exists(baseDir)) {
          await mkdir(baseDir);
        }
        tableBody = document.querySelector(".table_body");
 
        if (!tableBody) {
          return;
        };
      
        const files = await readDir(baseDir);

        tableBody!.innerHTML = '';

        if (files.length === 0) {
          tableBody!.innerHTML = '<tr><td colspan="2">No hay notas guardadas.</td></tr>';
          return;
        }

        files.forEach(async (file) => {
          if (file.name) {
            const note_name = file.name;
            const note = document.createElement("tr");
            note.classList.add("note");
            const celda_nombre = document.createElement("td");
            celda_nombre.classList.add("note_name");
            celda_nombre.textContent = note_name;
            note.appendChild(celda_nombre);
            const celda_acciones = document.createElement("td");
            celda_acciones.classList.add("note_actions");
            const viewNoteButton = document.createElement("button");
            viewNoteButton.classList.add("note-button", "view-note-button_2");
            viewNoteButton.textContent = "Ver";
            viewNoteButton.setAttribute('data-note-name', file.name);
            celda_acciones.appendChild(viewNoteButton);
            const deleteNoteButton = document.createElement("button");
            deleteNoteButton.classList.add("note-button", "delete-note-button"); 
            deleteNoteButton.textContent = "Eliminar";
            deleteNoteButton.setAttribute('data-note-name', file.name);
            celda_acciones.appendChild(deleteNoteButton);

            // Hacemos lo mismo para el botón de ver/editar
            const viewNoteButton2 = celda_acciones.querySelector('.note-button'); // Reutilizamos el botón que ya creaste
            if (viewNoteButton2) {
                viewNoteButton2.classList.add('view-note-button');
                viewNoteButton2.setAttribute('data-note-name', file.name);
            }

            note.appendChild(celda_acciones);
            tableBody!.appendChild(note);
          }
        });
    } catch (error) {
      console.error(error);
      message("Error al obtener las notas " + error, { kind: "error" });
    }
}

// Funcion para crear una nota otra vez
async function crearNoteAgain() {
  let result = await ask("Nota creada exitosamente, ¿Quieres crear otra nota?");
  if (result) {
    window.location.href = "/src/creanota.html";
  } else {
    window.location.href = "/src/index.html";
  }
}

// Funcion para eliminar una nota
async function deleteNote(noteName: string) {
  try {
    const confirmed = await ask(`¿Estás seguro de que quieres eliminar la nota "${noteName.replace(/\.txt$/, '')}"?`, {
      title: 'Confirmar eliminación',
      kind: 'warning'
    });

    if (confirmed) {
      const notesDir = await path.join(await path.documentDir(), "notes");
      const filePath = await path.join(notesDir, noteName);
      
      await remove(filePath);
      
      // Volver a cargar la lista de notas para que se actualice la tabla
      await getNotes();
    }
  } catch (error) {
    console.error("Error al eliminar la nota:", error);
    await message(`No se pudo eliminar la nota. Error: ${error}`, { kind: "error", title: "Error" });
  }
}

// Nueva función para cargar una nota en el formulario de edición
async function loadNoteForEditing(noteName: string) {
  try {
    const notesDir = await path.join(await path.documentDir(), "notes");
    const filePath = await path.join(notesDir, noteName);

    const fileContents = await readFile(filePath);
    const noteContentText = new TextDecoder().decode(fileContents);

    const noteNameInput = document.querySelector<HTMLInputElement>("#note-name");
    const noteContentInput = document.querySelector<HTMLTextAreaElement>("#note-content");
    const formTitle = document.querySelector("h1");

    if (noteNameInput && noteContentInput) {
      noteNameInput.value = noteName.replace(/\.txt$/, '');
      noteContentInput.value = noteContentText;

      // Opcional: Cambiar el título para que diga "Editando Nota"
      if(formTitle) formTitle.textContent = `Editando: ${noteName.replace(/\.txt$/, '')}`;
    }

  } catch (error) {
    console.error("Error al cargar la nota para editar:", error);
    await message(`No se pudo cargar la nota. Error: ${error}`, { kind: "error", title: "Error" });
  }
}

// Funcion para crear una nota
async function createNote(noteName: string, noteContent: string) {
  try {  
    baseDir = await path.documentDir() + "/notes";
    if (!await exists(baseDir)) {
      await mkdir(baseDir);
    }
    let file_path = await path.join(baseDir, noteName + ".txt");
    if (await exists(file_path)) {
      ask("El archivo ya existe, ¿desea sobreescribirlo?").then((result) => {
        if (result) {
          open(file_path, { write: true }).then((file) => {
            file.write(new TextEncoder().encode(noteContent));
            file.close();
            crearNoteAgain();
          });
        }
      });
    } else {

    let file = await create(file_path);
    await file.write(new TextEncoder().encode(noteContent));
    await file.close();
    crearNoteAgain();
    }
  } catch (error) {
    console.error(error);
    message("Error al crear la nota " + error, { kind: "error" });
  }
}

async function load_note() {
  const note_title = document.querySelector("#note-name");
  const note_content = document.querySelector("#note-content");
  const file = await readFile(note_path);
  const content = new TextDecoder().decode(file);
  note_content!.textContent = content;
  note_title!.textContent = note_name;
  note_name = "";
  note_path = "";
}

window.addEventListener("DOMContentLoaded", () => {
  exitButtonEl = document.querySelector(".exit-button");
  exitButtonEl?.addEventListener("click", () => {
    goodBye();
  });
  backButtonEl = document.querySelector(".back-button");
  backButtonEl?.addEventListener("click", () => {
    back();
  });
  noteFormEl = document.querySelector(".note-form");
  noteName = document.querySelector("#note-name");  
  noteContent = document.querySelector("#note-content");
  noteFormEl?.addEventListener("submit", (e) => {
    e.preventDefault();
    createNote(noteName!.value, noteContent!.value);
  });
  createNoteButtonEl = document.querySelector("#create-note-button");
  createNoteButtonEl?.addEventListener("click", () => {
    window.location.href = "/src/creanota.html";
  });
  viewNoteButtonEl = document.querySelector("#view-note-button");
  viewNoteButtonEl?.addEventListener("click", () => {
    window.location.href = "/src/vernota.html";
  });

  if (window.location.pathname.includes("creanota.html")) {
    if (note_name && note_path) {
      load_note();      
    }
    const urlParams = new URLSearchParams(window.location.search);
    const noteToEdit = urlParams.get('edit');
    if (noteToEdit) {
      loadNoteForEditing(noteToEdit);
    }
  }

  // 2. Comprobamos en qué página estamos y actuamos en consecuencia.
  if (window.location.pathname.includes("vernota.html")) {
    getNotes();

    // 3. Delegación de eventos: Escuchamos clics en el cuerpo de la tabla
    const tableBodyEl = document.querySelector(".table_body");
    tableBodyEl?.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      // Comprobamos si el clic fue en un botón de eliminar
      if (target && target.classList.contains('delete-note-button')) {
        const noteName = target.getAttribute('data-note-name');
        if (noteName) {
          deleteNote(noteName);
        }
      }
      // Comprobamos si el clic fue en un botón de ver/editar
      if (target && target.classList.contains('view-note-button')) {
        const noteName = target.getAttribute('data-note-name');
        if (noteName) {
          // Navegamos a la página de creación con el nombre de la nota como parámetro
          window.location.href = `/src/creanota.html?edit=${encodeURIComponent(noteName)}`;
        }
      }
    });
  }
});