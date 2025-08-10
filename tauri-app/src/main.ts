import { exit } from '@tauri-apps/plugin-process';
import { ask, message } from '@tauri-apps/plugin-dialog';
import { create, exists, open, mkdir } from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';

let exitButtonEl: HTMLButtonElement | null;
let backButtonEl: HTMLButtonElement | null;
let noteFormEl: HTMLFormElement | null;
let noteName: HTMLInputElement | null;
let noteContent: HTMLTextAreaElement | null;
let baseDir: string;

async function goodBye() {
  let result = await ask("¿Estás seguro de querer salir?");
  if (result) {
    exit();
  }
}

function back() {
    window.location.href = "../index.html";
}

async function crearNoteAgain() {
  let result = await ask("Nota creada exitosamente, ¿Quieres crear otra nota?");
  if (result) {
    window.location.href = "creanota.html";
  } else {
    window.location.href = "index.html";
  }
}

async function createNote(noteName: string, noteContent: string) {
  try {  
    baseDir = await path.documentDir() + "/notes";
    if (!await exists(baseDir)) {
      await mkdir(baseDir);
    }
    let file_path = await path.join(baseDir!, noteName + ".txt");
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
});