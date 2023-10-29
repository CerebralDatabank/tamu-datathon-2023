# tamu-datathon-2023

TAMU Datathon 2023 Repo

## Files and explanations

### `byod-scraper.js`

Web-scrapes all of the required data for the analyzer and saves it in three `*-data.json` files.

Parameters:

- `let major = "...";`: The major to grab courses for. This should be in the same format as the major course catalog; for example, `major` should be `engineering/computer-science` for the Computer Science catalog URL `https://catalog.tamu.edu/undergraduate/engineering/computer-science/bs`.

### `byod-analyzer.js`

Analyzes the data and saves a report in `report.html`.

Parameters:

- `const weights = {...};`: Custom weights that allow you to tweak the intermediate and final weighted score for each professor/section entry.
    - `ratingLvl`: Weights of ratings 1 through 5.
    - `ratingWTA`: Weight of the "would take again" percentage.
    - `finalProf`: Weight of the prof score in the final score calculation.
    - `finalGpa`: Weight of the GPA score in the final score calculation.

### `course-data.json`,`gpa-data.json`, `prof-data.json`

Course, GPA, and professor rating data - the three files written to by `byod-scraper.js`.

### `report.html`

HTML report of optimal course selections, sorted with highest final score first - the one file written to by `byod-analyzer.js`.

### `html-example.txt`

Sections of HTML code from the major course catalog page. These were used when testing the regex that searches for single and multiple-choice course entries.

### `query-template.txt`

Part of the request to the [ratemyprofessors.com](https://www.ratemyprofessors.com/) page, recorded here in formatted form for reference because it represents the structure of the received data.

### `byod-notes.txt`

Notes on HTML data of certain values on the [ratemyprofessors.com](https://www.ratemyprofessors.com/) page for a professor, for eventual regex parsing to get those values. This was unnecessary because the site's API endpoint for professor name search returned all required data.
