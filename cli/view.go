package main

import "fmt"

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