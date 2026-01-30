# Makefile for FHIR Questionnaire Skill Packaging

SKILL_NAME = fhir-questionnaire
SKILL_FILE = $(SKILL_NAME).skill
SKILL_DIR = $(SKILL_NAME)

.PHONY: all package clean test-package help

# Default target
all: package

# Package the skill into a distributable .skill file
package: clean
	@echo "Packaging $(SKILL_NAME) skill..."
	@cd $(SKILL_DIR) && zip -r ../$(SKILL_FILE) . \
		-x "*.pyc" \
		-x "*__pycache__*" \
		-x "*.egg-info/*" \
		-x ".venv/*" \
		-x ".venv" \
		-x ".DS_Store" \
		-x "*.swp" \
		-x "*~"
	@echo "✓ Created $(SKILL_FILE)"
	@echo "  Size: $$(du -h $(SKILL_FILE) | cut -f1)"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -f $(SKILL_FILE)
	@find $(SKILL_DIR) -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	@find $(SKILL_DIR) -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "✓ Clean complete"

# Test the package by listing its contents
test-package:
	@if [ ! -f $(SKILL_FILE) ]; then \
		echo "Error: $(SKILL_FILE) not found. Run 'make package' first."; \
		exit 1; \
	fi
	@echo "Package contents:"
	@unzip -l $(SKILL_FILE)
	@echo ""
	@echo "Package info:"
	@echo "  File: $(SKILL_FILE)"
	@echo "  Size: $$(du -h $(SKILL_FILE) | cut -f1)"
	@echo "  Files: $$(unzip -l $(SKILL_FILE) | tail -1 | awk '{print $$2}')"

# Display help information
help:
	@echo "FHIR Questionnaire Skill - Build System"
	@echo ""
	@echo "Targets:"
	@echo "  make package       - Create the .skill package file (default)"
	@echo "  make clean         - Remove build artifacts and cache files"
	@echo "  make test-package  - Display package contents and info"
	@echo "  make help          - Show this help message"
	@echo ""
	@echo "Output:"
	@echo "  $(SKILL_FILE) - Distributable skill package"
