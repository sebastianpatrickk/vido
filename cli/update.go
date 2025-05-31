package main

import (
	"fmt"
	"path/filepath"

	tea "github.com/charmbracelet/bubbletea"
)

type processingMsg struct {
	videoIndex int
	result     ProcessingResult
	progress   ProcessingProgress
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		if msg.String() == KeyQuit || msg.String() == KeyCtrlC {
			return m, tea.Quit
		}

		switch m.state {
		case menu:
			switch msg.String() {
			case KeyUp, "k":
				if m.menuIndex > 0 {
					m.menuIndex--
				}
			case KeyDown, "j":
				if m.menuIndex < 1 {
					m.menuIndex++
				}
			case KeyEnter:
				if m.menuIndex == 0 {
					m.state = uploadStepFolder
					m.textinput.SetValue("")
					m.textinput.Focus()
				} else {
					m.state = exploreFiles
				}
			}
		case uploadStepFolder:
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
				m.reset()
				return m, nil
			}
			return m, cmd
		case uploadStepScan:
		case uploadStepSummary:
			switch msg.String() {
			case KeyEnter:
				if len(m.videos) == 0 {
					m.state = uploadStepFolder
					m.textinput.SetValue("")
					m.textinput.Focus()
					m.scanError = "No video files found. Please select a folder containing video files."
				} else {
					m.state = selectOutputDirMenu
				}
			case KeyEsc:
				m.reset()
			}
		case selectOutputDirMenu:
			switch msg.String() {
			case KeyUp, "k":
				if m.outputMenuIndex > 0 {
					m.outputMenuIndex--
				}
			case KeyDown, "j":
				if m.outputMenuIndex < 1 {
					m.outputMenuIndex++
				}
			case KeyEnter:
				if m.outputMenuIndex == 0 {
					m.state = selectOutputDir
					m.textinput.SetValue("")
					m.textinput.Focus()
				} else {
					m.outputDir = filepath.Join(m.folderPath, "processed")
					m.state = processing
					m.totalVideos = len(m.videos)
					m.currentVideo = 0
					m.progress = 0
					return m, func() tea.Msg {
						var results []processingMsg
						for i, video := range m.videos {
							result, progress := processVideo(video.Path, m.outputDir, i, len(m.videos))
							results = append(results, processingMsg{i, result, progress})
						}
						return results
					}
				}
			case KeyEsc:
				m.state = uploadStepSummary
			}
		case selectOutputDir:
			var cmd tea.Cmd
			m.textinput, cmd = m.textinput.Update(msg)
			if msg.Type == tea.KeyEnter {
				m.outputDir = m.textinput.Value()
				m.state = processing
				m.totalVideos = len(m.videos)
				m.currentVideo = 0
				m.progress = 0
				return m, func() tea.Msg {
					var results []processingMsg
					for i, video := range m.videos {
						result, progress := processVideo(video.Path, m.outputDir, i, len(m.videos))
						results = append(results, processingMsg{i, result, progress})
					}
					return results
				}
			}
			if msg.Type == tea.KeyEsc {
				m.state = selectOutputDirMenu
				return m, nil
			}
			return m, cmd
		case processing:
			if msg.String() == KeyQuit {
				m.reset()
			}
		case exploreFiles:
			if msg.String() == KeyEsc || msg.String() == KeyQuit {
				m.reset()
			}
		case done:
			if msg.String() == KeyQuit {
				return m, tea.Quit
			}
		}
	case scanResultMsg:
		if msg.err != nil {
			m.scanError = msg.err.Error()
			m.state = uploadStepFolder
		} else {
			m.videos = msg.videos
			m.state = uploadStepSummary
		}
	case []processingMsg:
		var success, failure int
		for _, result := range msg {
			if result.result.Success {
				success++
			} else {
				failure++
			}
			m.currentVideo = result.videoIndex
			m.progress = result.progress.Progress
			m.processingMsg = result.progress.Message
		}
		m.processingMsg = fmt.Sprintf("Processing complete!\nSuccessfully processed: %d\nFailed: %d", success, failure)
	}
	return m, nil
}