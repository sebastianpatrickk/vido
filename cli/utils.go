package main

import (
	"os"
	"path/filepath"
	"strings"
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