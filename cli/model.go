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
	selectOutputDirMenu
	selectOutputDir
	processing
	exploreFiles
	done
)

type scanResultMsg struct {
	videos []VideoFile
	err    error
}

type model struct {
	state         state
	menuIndex     int
	outputMenuIndex int
	videos        []VideoFile
	scanError     string
	folderPath    string
	outputDir     string
	textinput     textinput.Model
	processingMsg string
}

func initialModel() model {
	ti := textinput.New()
	ti.Placeholder = "/path/to/folder"
	ti.Focus()
	ti.CharLimit = 256
	ti.Width = 40
	return model{
		state:          menu,
		menuIndex:      0,
		outputMenuIndex: 0,
		textinput:      ti,
	}
}

func (m model) Init() tea.Cmd { return nil }