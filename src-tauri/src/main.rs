#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{LogicalSize, Manager, Size};



// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
  tauri::Builder::default()
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            println!("Initializing...");

            main_window
                .set_size(Size::Logical(LogicalSize {
                    width: 1200.0,
                    height: 800.0,
                }))
                .unwrap();
                        main_window
                .set_title("MCP Estimator")
                .unwrap();
            main_window.set_resizable(true).unwrap();
            println!("Done set size.");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

}