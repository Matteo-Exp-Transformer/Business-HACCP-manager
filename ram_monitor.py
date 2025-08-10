#!/usr/bin/env python3
"""
Monitor RAM Ultra-Leggero
Monitora l'utilizzo RAM e avvisa quando aprire una nuova chat
"""

import psutil
import time
import os
from datetime import datetime

def get_ram_info():
    """Ottiene informazioni RAM in modo ultra-leggero"""
    memory = psutil.virtual_memory()
    return {
        'total': memory.total // (1024**3),  # GB
        'used': memory.used // (1024**3),    # GB
        'free': memory.free // (1024**3),    # GB
        'percent': memory.percent
    }

def get_chat_ram_estimate():
    """Stima RAM usata dalla chat (approssimativa)"""
    # Stima basata su processi browser/chat
    chat_processes = []
    for proc in psutil.process_iter(['pid', 'name', 'memory_info']):
        try:
            if any(name in proc.info['name'].lower() for name in ['chrome', 'firefox', 'edge', 'cursor', 'vscode']):
                memory_mb = proc.info['memory_info'].rss // (1024**2)
                if memory_mb > 50:  # Solo processi che usano >50MB
                    chat_processes.append(memory_mb)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    
    return sum(chat_processes) // 1024  # GB

def show_ram_status():
    """Mostra stato RAM in modo minimalista"""
    os.system('cls' if os.name == 'nt' else 'clear')
    
    ram = get_ram_info()
    chat_ram = get_chat_ram_estimate()
    
    print("🖥️  MONITOR RAM ULTRA-LEGGERO")
    print("=" * 40)
    print(f"📊 RAM Totale: {ram['total']} GB")
    print(f"💾 RAM Usata: {ram['used']} GB ({ram['percent']}%)")
    print(f"🆓 RAM Libera: {ram['free']} GB")
    print(f"💬 Chat (stima): ~{chat_ram} GB")
    print("=" * 40)
    
    # Avvisi intelligenti
    if ram['percent'] > 90:
        print("🚨 CRITICO! Apri nuova chat IMMEDIATAMENTE!")
    elif ram['percent'] > 80:
        print("⚠️  ATTENZIONE! Considera di aprire nuova chat")
    elif ram['percent'] > 70:
        print("💡 Suggerimento: Salva il lavoro e preparati per nuova chat")
    else:
        print("✅ RAM OK - Puoi continuare tranquillamente")
    
    print("=" * 40)
    print(f"🕐 Ultimo aggiornamento: {datetime.now().strftime('%H:%M:%S')}")
    print("💡 Premi Ctrl+C per uscire")

def main():
    """Loop principale ultra-leggero"""
    print("🚀 Avvio Monitor RAM...")
    time.sleep(1)
    
    try:
        while True:
            show_ram_status()
            time.sleep(30)  # Aggiorna ogni 30 secondi (molto leggero)
    except KeyboardInterrupt:
        print("\n👋 Monitor fermato. RAM liberata!")

if __name__ == "__main__":
    main()
