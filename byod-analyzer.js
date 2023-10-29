const fs = require("fs").promises;

const weights = {
  ratingLvl: [-2, -1, 0.5, 2, 4],
  ratingWTA: 0.5,
  finalProf: 0.5,
  finalGpa: 0.5
};

function arrToTable(arr) {
  let tblRows = arr.map(entry => `<tr>${entry.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("");
  return `<table><thead><tr><th>Course</th><th>GPA</th><th>Professor</th><th>Prof Score</th><th>Total Score</th></tr></thead><tbody>${tblRows}</tbody></table>`;
}

function judgeProf(name, data) {
  let score = 0;
  let edges = data[name].data.newSearch.teachers.edges;
  let rtgArr = [];
  let totalCount = 0;
  for (let idx in edges) {
    let node = edges[idx].node;
    let dist = node.ratingsDistribution;
    if (dist.total == 0) continue;
    rtgArr.push([
      weights.ratingLvl[0] * (dist.r1 / dist.total) +
      weights.ratingLvl[1] * (dist.r2 / dist.total) +
      weights.ratingLvl[2] * (dist.r3 / dist.total) +
      weights.ratingLvl[3] * (dist.r4 / dist.total) +
      weights.ratingLvl[4] * (dist.r5 / dist.total),
      dist.total,
      (1 + weights.ratingWTA * node.wouldTakeAgainPercentRounded / 100)
    ]);
    totalCount += dist.total;
  }
  rtgArr.forEach(pair => {
    score += (
      pair[0] *
      (pair[1] / totalCount) *
      pair[2]
    );
  });
  return score;
}

function judgeFinal(gpaScore, profScore) {
  return weights.finalGpa * gpaScore + weights.finalProf * profScore;
}

async function main() {
  courseData = JSON.parse(await fs.readFile("course-data.json", "utf8"));
  profData = JSON.parse(await fs.readFile("prof-data.json", "utf8"));
  gpaData = JSON.parse(await fs.readFile("gpa-data.json", "utf8"));
  let results = [];
  for (let i = 0; i < courseData.length; i++) {
    let candidates = [];
    for (let j = 0; j < courseData[i].length; j++) {
      let course = courseData[i][j];
      console.log(`Processing #${i} ${course}`);
      let gpas = gpaData[course]?.classes.map(obj => obj.gpa);
      if (gpas === undefined) continue;
      let avgGpa = gpas.map(n => Number(n)).reduce((a, b) => a + b, 0) / gpas.length
      if (isNaN(avgGpa)) avgGpa = 0;
      let profs = gpaData[course].classes.map(obj => obj.prof);
      profs = [...new Set(profs)];
      profScores = [];
      for (let prof of profs) {
        if (profData[prof] === undefined) {
          candidates.push(course, avgGpa, "Unknown Prof", 0);
          continue;
        }
        let node = profData[prof].data.newSearch.teachers.edges[0]?.node ?? {firstName: "Unknown", lastName: "Name"};
        profScores.push([
          `${node.firstName} ${node.lastName} (${prof})`,
          judgeProf(prof, profData)
        ]);
      }
      if (profScores.length == 0) {
        candidates.push([course, avgGpa, "No Prof Data", 0, 0]);
      }
      profScores.sort((a, b) => b[1] - a[1]);
      candidates.push([course, avgGpa, profScores[0][0], profScores[0][1], judgeFinal(avgGpa, profScores[0][1])]);
    }
    candidates.sort((a, b) => b[4] - a[4]);
    // When there are multiple course choices, pick the best one
    results.push(candidates[0]);
  }
  results = results.sort((a, b) => b[4] - a[4]);

  await fs.writeFile("report.html", `<!DOCTYPE html><html><head><title>Course Report</title><style>body {background: #FFF; color: #000; font-family: 'Segoe UI', 'Arial', sans-serif;} table {border: 1px solid #000; border-collapse: collapse;} td, th {border: 1px solid #000; padding: 10px;} th {font-weight: bold;} tbody tr:nth-child(odd) {background: #DDD;}</style></head><body><h1>Course Report</h1><p>Prof and total score are weighted based on custom weights. For course selections with multiple choices, the best has been selected.</p>${arrToTable(results)}</body></html>`, "utf8");

  console.log(`Files written; done (check report.html)`);
}

main();