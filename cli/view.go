package main

import (
	"fmt"
	"strings"
)

const (
	keyHints = "\nUse ↑/↓ or j/k to move, Enter to select, Esc to go back, q to quit."
	quitHint = "\nPress q to quit."
)

func renderProgressBar(progress float64, width int) string {
	filled := int(float64(width) * progress)
	empty := width - filled
	return fmt.Sprintf("[%s%s] %.1f%%",
		strings.Repeat("=", filled),
		strings.Repeat(" ", empty),
		progress*100)
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
		s += keyHints
		return s
	case uploadStepFolder:
		s := "Upload files\n\nPaste the path to a folder containing videos and press Enter:\n\n"
		if m.scanError != "" {
			s += fmt.Sprintf("Error: %s\n\n", m.scanError)
		}
		s += m.textinput.View() + "\n\nPress Enter to continue, Esc to go back, q to quit."
		return s
	case uploadStepScan:
		return "Scanning folder for video files..." + quitHint
	case uploadStepSummary:
		if len(m.videos) == 0 {
			return "No video files found in the selected folder.\nPress Enter to try again, q to quit."
		}
		s := "Found video files:\n\n"
		for _, v := range m.videos {
			s += fmt.Sprintf("• %s\n  Name: %s\n  Tags: %v\n  Path: %s\n\n",
				v.Filename, v.Name, v.Tags, v.Path)
		}
		s += "Press Enter to select output directory, q to quit."
		return s
	case selectOutputDirMenu:
		s := "Select output directory option:\n\n"
		menuItems := []string{
			"Use custom path",
			fmt.Sprintf("Create 'processed' folder in %s", m.folderPath),
		}
		for i, item := range menuItems {
			cursor := " "
			if m.outputMenuIndex == i {
				cursor = ">"
			}
			s += fmt.Sprintf(" %s %s\n", cursor, item)
		}
		s += keyHints
		return s
	case selectOutputDir:
		return "Enter custom output directory path:\n\n" +
			m.textinput.View() +
			"\n\nPress Enter to start processing, Esc to go back, q to quit."
	case processing:
		s := "Processing videos...\n\n"
		
		// Show overall progress
		s += fmt.Sprintf("Overall Progress: %s\n\n", renderProgressBar(m.progress, 40))
		
		// Show current video progress
		if m.totalVideos > 0 {
			s += fmt.Sprintf("Processing video %d of %d\n", m.currentVideo+1, m.totalVideos)
		}
		
		// Show current operation
		if m.processingMsg != "" {
			s += fmt.Sprintf("\n%s\n", m.processingMsg)
		}
		
		s += quitHint
		return s
	case exploreFiles:
		return "Explore files (not implemented yet)." + quitHint
	case done:
		return "Done!" + quitHint
	}
	return ""
}