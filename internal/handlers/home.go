package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"text/template"
)

// import (
// 	"net/http"

// 	"web-forum/internal/models"
// 	"web-forum/internal/services"
// 	"web-forum/internal/utils"
// )

// type HomeHandler struct {
// 	HomeService *services.HomeService
// }

// func NewHomeHandler(HomeService *services.HomeService) *HomeHandler {
// 	return &HomeHandler{HomeService: HomeService}
// }

//	func (h *HomeHandler) FetchPosts(w http.ResponseWriter, r *http.Request) {
//		// if r.URL.Path != "/" {
//		// 	utils.RespondWithJSON(w, http.StatusNotFound, models.Error{Message: "Page Not Found", Code: http.StatusNotFound})
//		// 	return
//		// }
//		if r.Method != http.MethodGet {
//			utils.RespondWithJSON(w, http.StatusMethodNotAllowed, models.Error{Message: "Method Not Allowed", Code: http.StatusMethodNotAllowed})
//			return
//		}
//		Posts, err := h.HomeService.FetchPosts()
//		if err.Code != http.StatusOK {
//			utils.RespondWithJSON(w, http.StatusInternalServerError, models.Error{
//				Message: "Internal server error",
//				Code:    http.StatusInternalServerError,
//			})
//			return
//		}
//		utils.RespondWithJSON(w, http.StatusOK, Posts)
//	}
func Parsefile(url string) (*template.Template, error) {
	templ, err := template.ParseFiles(url)

	return templ, err
}

func Servstatique(w http.ResponseWriter, r *http.Request) {
	fmt.Println("URL.Path:", r.URL.Path)

	staticPrefix := "/front-end/static/"
	relPath := strings.TrimPrefix(r.URL.Path, staticPrefix)
	fmt.Println("Relative Path:", relPath)

	baseDir := "front-end/static"
	fullPath := filepath.Join(baseDir, filepath.Clean(relPath))
	fmt.Println("Full Path:", fullPath)

	fileInfo, err := os.Stat(fullPath)
	if err != nil {
		fmt.Println("Error:", err)
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}
	if fileInfo.IsDir() {
		fmt.Println("Requested path is a directory")
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	http.ServeFile(w, r, fullPath)
}
