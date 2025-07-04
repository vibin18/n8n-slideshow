package models

// TextElement represents a text overlay on the slideshow
type TextElement struct {
	Content  string `json:"content"`
	X        int    `json:"x"`
	Y        int    `json:"y"`
	FontSize int    `json:"fontSize,omitempty"`
	Font     string `json:"font,omitempty"`
}

// SlideData represents the data for a single slide
type SlideData struct {
	Image           string        `json:"image"`
	Text            []TextElement `json:"text"`
	TextColor       string        `json:"text-color"`
	TransitionEffect string        `json:"transition-effect"`
	TransitionTime  int           `json:"transition-time"`
}
