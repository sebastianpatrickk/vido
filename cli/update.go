package main

import tea "github.com/charmbracelet/bubbletea"

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch m.state {
	case menu:
		switch msg := msg.(type) {
		case tea.KeyMsg:
			switch msg.String() {
			case "up", "k":
				if m.menuIndex > 0 {
					m.menuIndex--
				}
			case "down", "j":
				if m.menuIndex < 1 {
					m.menuIndex++
				}
			case "enter":
				if m.menuIndex == 0 {
					m.state = uploadStepFolder
					m.textinput.SetValue("")
					m.textinput.Focus()
				} else {
					m.state = exploreFiles
				}
			case "ctrl+c", "q":
				return m, tea.Quit
			}
		}
	case uploadStepFolder:
		switch msg := msg.(type) {
		case tea.KeyMsg:
			var cmd tea.Cmd
			m.textinput, cmd = m.textinput.Update(msg)
			if msg.Type == tea.KeyEnter {
				m.folderPath = m.textinput.Value()
				m.state = uploadStepScan
				return m, func() tea.Msg {
					videos, err := scanFolder(m.folderPath)
					return scanResultMsg{videos, err}
				}
			}
			if msg.Type == tea.KeyEsc {
				m.state = menu
				return m, nil
			}
			return m, cmd
		}
	case uploadStepScan:
		switch msg := msg.(type) {
		case scanResultMsg:
			if msg.err != nil {
				m.scanError = msg.err.Error()
				m.state = uploadStepFolder
			} else {
				m.videos = msg.videos
				m.state = uploadStepSummary
			}
		}
	case uploadStepSummary:
		switch msg := msg.(type) {
		case tea.KeyMsg:
			switch msg.String() {
			case "enter", "q":
				m.state = menu
			case "ctrl+c":
				return m, tea.Quit
			}
		}
	case exploreFiles:
		switch msg := msg.(type) {
		case tea.KeyMsg:
			if msg.String() == "q" || msg.String() == "ctrl+c" {
				m.state = menu
			}
		}
	case done:
		switch msg := msg.(type) {
		case tea.KeyMsg:
			if msg.String() == "q" || msg.String() == "ctrl+c" {
				return m, tea.Quit
			}
		}
	}
	return m, nil
}