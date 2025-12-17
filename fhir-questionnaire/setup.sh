#!/bin/bash
# Setup script for FHIR Questionnaire Skill
# This script initializes the Python environment with required dependencies

set -e

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Setting up FHIR Questionnaire Skill..."

# Check if uv is available (preferred)
if command -v uv &> /dev/null; then
    echo "Using uv to install dependencies..."
    cd "$SKILL_DIR"

    # Create virtual environment if it doesn't exist
    if [ ! -d ".venv" ]; then
        echo "Creating virtual environment with uv..."
        uv venv
    fi

    # Install dependencies
    echo "Installing dependencies..."
    uv pip install -r requirements.txt

    echo "✅ Setup complete! Dependencies installed in .venv/"
    echo ""
    echo "To use the scripts, activate the virtual environment:"
    echo "  source $SKILL_DIR/.venv/bin/activate"

# Fallback to pip
elif command -v pip3 &> /dev/null; then
    echo "Using pip3 to install dependencies..."
    pip3 install -r "$SKILL_DIR/requirements.txt" --user
    echo "✅ Setup complete! Dependencies installed with pip3."

elif command -v pip &> /dev/null; then
    echo "Using pip to install dependencies..."
    pip install -r "$SKILL_DIR/requirements.txt" --user
    echo "✅ Setup complete! Dependencies installed with pip."

else
    echo "❌ Error: Neither uv nor pip found. Please install one of:"
    echo "  - uv: https://github.com/astral-sh/uv"
    echo "  - pip: Comes with Python"
    exit 1
fi

echo ""
echo "To verify installation, run:"
echo "  python3 -c 'import jsonschema; print(\"jsonschema version:\", jsonschema.__version__)'"
