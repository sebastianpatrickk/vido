package main

import (
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
)

type state int

const (
	menu state = iota
	uploadStepFolder
	uploadStepScan
	uploadStepSummary
	exploreFiles
	done
)

type scanResultMsg struct {
	videos []VideoFile
	err    error
}

type model struct {
	state      state
	menuIndex  int
	videos     []VideoFile
	scanError  string
	folderPath string
	textinput  textinput.Model
}

func initialModel() model {
	ti := textinput.New()
	ti.Placeholder = "/path/to/folder"
	ti.Focus()
	ti.CharLimit = 256
	ti.Width = 40
	return model{
		state:      menu,
		menuIndex:  0,
		textinput:  ti,
	}
}

func (m model) Init() tea.Cmd { return nil }