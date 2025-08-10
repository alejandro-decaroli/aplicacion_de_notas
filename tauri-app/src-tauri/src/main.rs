// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_app_lib::run;

fn main() {
    // Ahora `run` está en el scope y puede ser llamado directamente.
    run();
}
