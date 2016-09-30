# Dependency Scanner
Reads `package.json` of directory it was called within and outputs dependencies.

## Installation
```
npm install -g dependency-scanner
```

## Usage
Once installed, navigate to a node project directory and run: 
```
# Outputs all dependency types in alpha order
dependency-scanner

# Or you can pipe it to your clipboard
dependency-scanner | pbcopy
```
 
 