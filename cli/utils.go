package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
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

type ProcessingResult struct {
	Success bool
	Message string
}

type ProcessingProgress struct {
	CurrentVideo int
	TotalVideos  int
	Progress     float64
	Message      string
}

func processVideo(inputPath, outputDir string, currentVideo, totalVideos int) (ProcessingResult, ProcessingProgress) {
	// Create output directory if it doesn't exist
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return ProcessingResult{Success: false, Message: fmt.Sprintf("Failed to create output directory: %v", err)},
			ProcessingProgress{CurrentVideo: currentVideo, TotalVideos: totalVideos, Progress: 0, Message: "Failed to create output directory"}
	}

	// Get the base filename without extension
	filename := filepath.Base(inputPath)
	basename := strings.TrimSuffix(filename, filepath.Ext(filename))

	// Create specific output directory for this video
	videoOutputDir := filepath.Join(outputDir, basename)
	if err := os.MkdirAll(videoOutputDir, 0755); err != nil {
		return ProcessingResult{Success: false, Message: fmt.Sprintf("Failed to create video output directory: %v", err)},
			ProcessingProgress{CurrentVideo: currentVideo, TotalVideos: totalVideos, Progress: 0, Message: "Failed to create video output directory"}
	}

	// Define resolutions, bitrates, and output names
	resolutions := []string{"1280x720", "1920x1080", "3840x2160"}
	bitrates := []string{"1200k", "2500k", "8000k"}
	outputs := []string{"720p", "1080p", "2160p"}

	// Process each resolution
	for i, res := range resolutions {
		outputName := outputs[i]
		bitrate := bitrates[i]
		playlist := fmt.Sprintf("%s.m3u8", outputName)

		// Calculate progress for this resolution
		progress := float64(i) / float64(len(resolutions))
		overallProgress := (float64(currentVideo) + progress) / float64(totalVideos)

		// Set profile and level based on resolution
		profile := "main"
		level := "3.1"
		if outputName == "2160p" {
			profile = "high"
			level = "5.1"
		} else if outputName == "1080p" {
			profile = "high"
			level = "4.2"
		}

		cmd := exec.Command("ffmpeg", "-y",
			"-i", inputPath,
			"-c:v", "libx264",
			"-preset", "veryfast",
			"-profile:v", profile,
			"-level:v", level,
			"-b:v", bitrate,
			"-s", res,
			"-c:a", "aac",
			"-b:a", "128k",
			"-ac", "2",
			"-g", "120",
			"-keyint_min", "120",
			"-sc_threshold", "0",
			"-force_key_frames", "expr:gte(t,n_forced*4)",
			"-hls_time", "4",
			"-hls_list_size", "0",
			"-hls_flags", "independent_segments",
			"-hls_segment_filename", filepath.Join(videoOutputDir, fmt.Sprintf("%s_%%03d.ts", outputName)),
			filepath.Join(videoOutputDir, playlist))

		if err := cmd.Run(); err != nil {
			return ProcessingResult{Success: false, Message: fmt.Sprintf("Failed to process %s: %v", outputName, err)},
				ProcessingProgress{CurrentVideo: currentVideo, TotalVideos: totalVideos, Progress: overallProgress, Message: fmt.Sprintf("Failed to process %s", outputName)}
		}
	}

	// Generate master playlist
	masterPlaylist := filepath.Join(videoOutputDir, "playlist.m3u8")
	content := "#EXTM3U\n#EXT-X-VERSION:3\n\n"

	for i, res := range resolutions {
		outputName := outputs[i]
		playlist := fmt.Sprintf("%s.m3u8", outputName)
		bitrate := bitrates[i]
		bandwidth := fmt.Sprintf("%d", (parseBitrate(bitrate)+128)*1000)

		content += fmt.Sprintf("#EXT-X-STREAM-INF:BANDWIDTH=%s,RESOLUTION=%s\n%s\n\n",
			bandwidth, res, playlist)
	}

	if err := os.WriteFile(masterPlaylist, []byte(content), 0644); err != nil {
		return ProcessingResult{Success: false, Message: fmt.Sprintf("Failed to create master playlist: %v", err)},
			ProcessingProgress{CurrentVideo: currentVideo, TotalVideos: totalVideos, Progress: 1.0, Message: "Failed to create master playlist"}
	}

	return ProcessingResult{Success: true, Message: fmt.Sprintf("Successfully processed video to %s", videoOutputDir)},
		ProcessingProgress{CurrentVideo: currentVideo, TotalVideos: totalVideos, Progress: 1.0, Message: fmt.Sprintf("Completed processing %s", basename)}
}

func parseBitrate(bitrate string) int {
	value := strings.TrimSuffix(bitrate, "k")
	result, _ := strconv.Atoi(value)
	return result
} 