# tamu-datathon-2023

TAMU Datathon 2023 Repo

## Files and explanations

## `byod-scraper.js`

Web-scrapes all of the required data for the analyzer and saves it in three `*-data.json` files.

Parameters:

- `let major = "...";`: The major to grab courses for. This should be in the same format as the major course catalog; for example, `major` should be `engineering/computer-science` for the Computer Science catalog URL `https://catalog.tamu.edu/undergraduate/engineering/computer-science/bs`.

## `byod-analyzer.js`

Analyzes the data and saves a report in `report.html`.

Parameters:

- `const weights = {...};`: Custom weights that allow you to tweak the intermediate and final weighted score for each professor/section entry.
    - `ratingLvl`: Weights of ratings 1 through 5.
    - `ratingWTA`: Weight of the "would take again" percentage.
    - `finalProf`: Weight of the prof score in the final score calculation.
    - `finalGpa`: Weight of the GPA score in the final score calculation.