# 🍅 Pomodoro Timer

Aplicação web de **Pomodoro Timer** com ciclos configuráveis, controle de execução e **histórico de produtividade persistido no navegador**.  
O projeto foi desenvolvido utilizando **HTML, CSS e JavaScript puro**, sem frameworks ou bibliotecas externas.

## 📌 Funcionalidades

- ⏱️ Timer de **Trabalho** e **Pausa**
- ⚙️ Configuração dinâmica de:
  - Minutos de trabalho/estudo
  - Minutos de pausa
  - Número total de ciclos
  - Auto-start do próximo ciclo
- 🔁 Controle completo do timer:
  - Iniciar
  - Pausar
  - Retomar
  - Resetar
- 📊 Estatísticas automáticas:
  - Total de ciclos concluídos
  - Ciclos concluídos no dia atual
- 🗂️ Histórico persistente utilizando `localStorage`
- 📤 Exportação do histórico em arquivo JSON
- 📥 Importação de histórico via JSON
- 🧹 Limpeza total do histórico
- ⌨️ Atalho de teclado:
  - **Barra de espaço** → iniciar / pausar
- 📱 Interface responsiva e acessível

## 🛠️ Tecnologias Utilizadas

- **HTML5**
- **CSS3**
- **JavaScript (Vanilla JS)**
- **Web APIs**
  - `localStorage`
  - `FileReader`
  - `Blob`
  - `setInterval`

## 📂 Estrutura do Projeto

```text
/
├── index.html     # Estrutura e marcação da aplicação
├── style.css      # Estilos visuais e layout
├── script.js      # Lógica do timer, ciclos e histórico
└── README.md      # Documentação do projeto
