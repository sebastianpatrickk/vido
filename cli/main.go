package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
)

type VideoFile struct {
	Path     string
	Filename string
	Name     string
	Tags     []string
}

func extractNameAndTags(filename string) (name string, tags []string) {
	ext := filepath.Ext(filename)
	base := strings.TrimSuffix(filename, ext)
	parts := strings.SplitN(base, "__", 2)
	name = parts[0]
	if len(parts) > 1 {
		tags = strings.Split(parts[1], "_")
	}
	return
}

func scanFolder(folder string) ([]VideoFile, error) {
	var videos []VideoFile
	entries, err := os.ReadDir(folder)
	if err != nil {
		return nil, err
	}
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		ext := strings.ToLower(filepath.Ext(entry.Name()))
		if ext == ".mp4" || ext == ".mov" || ext == ".mkv" {
			name, tags := extractNameAndTags(entry.Name())
			videos = append(videos, VideoFile{
				Path:     filepath.Join(folder, entry.Name()),
				Filename: entry.Name(),
				Name:     name,
				Tags:     tags,
			})
		}
	}
	return videos, nil
}

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

func (m model) Init() tea.Cmd {
	return nil
}

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

func (m model) View() string {
	switch m.state {
	case menu:
		s := "Select an option:\n\n"
		menuItems := []string{"Upload files", "Explore files"}
		for i, item := range menuItems {
			cursor := " "
			if m.menuIndex == i {
				cursor = ">"
			}
			s += fmt.Sprintf(" %s %s\n", cursor, item)
		}
		s += "\nUse ↑/↓ or j/k to move, Enter to select, q to quit."
		return s
	case uploadStepFolder:
		return "Upload files\n\nPaste the path to a folder containing videos and press Enter:\n\n" +
			m.textinput.View() +
			"\n\n(Press Esc to cancel)"
	case uploadStepScan:
		return "Scanning folder for video files...\n"
	case uploadStepSummary:
		if len(m.videos) == 0 {
			return "No video files found in the selected folder.\nPress Enter or q to return to menu."
		}
		s := "Found video files:\n\n"
		for _, v := range m.videos {
			s += fmt.Sprintf("• %s\n  Name: %s\n  Tags: %v\n  Path: %s\n\n",
				v.Filename, v.Name, v.Tags, v.Path)
		}
		s += "Press Enter or q to return to menu."
		return s
	case exploreFiles:
		return "Explore files (not implemented yet).\nPress q to return to menu."
	case done:
		return "Done! Press q or Ctrl+C to exit."
	}
	return ""
}

func main() {
	p := tea.NewProgram(initialModel(), tea.WithAltScreen())
	if _, err := p.Run(); err != nil {
		fmt.Println("Error:", err)
		os.Exit(1)
	}
}