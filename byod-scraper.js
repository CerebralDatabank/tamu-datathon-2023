const fs = require("fs").promises;

async function main() {
  let majors = ["engineering/computer-science"];

  let profData = {};
  let gpaData = {};
  let courseData = [];

  let courseResp = await fetch(`https://catalog.tamu.edu/undergraduate/${majors[0]}/bs`).then(res => res.text());

  courseResp = courseResp.replace(/>(\s|\n)+?</g, "><");

  let matches = [...courseResp.matchAll(/(?:(?:<td[^<>]+?>)|(?:<br\/>))(<div style="margin-left:20px;" class="blockindent">)?(or )?<a [^<>]+? class="bubblelink code".+?>(.+?)<\/a>/g)];

  let courseDataPre = matches.map(m => [
    m[3],
    m[1] !== undefined && m[1].includes("blockindent"),
    m[2] !== undefined && m[2].includes("or")
  ]).map((a, i, orig) => [
    a[0],
    a[1] || (orig[i + 1] !== undefined && orig[i + 1][2])
  ]);

  for (let i = 0, j = -1; i < courseDataPre.length; i++) {
    if (i != 0 && courseDataPre[i][1] === true && courseDataPre[i - 1][1] === true) {
      // no-op
    }
    else {
      j++;
    }
    if (courseData[j] === undefined) courseData[j] = [courseDataPre[i][0]];
    else courseData[j].push(courseDataPre[i][0]);
  }

  for (let i = 0; i < courseData.length; i++) {
    for (let j = 0; j < courseData[i].length; j++) {
      if (courseData[i][j].includes("/")) {
        let pair = courseData[i][j].split("/");
        courseData[i][j] = pair[0];
        courseData[i].splice(j + 1, 0, pair[1]);
      }
    }
  }

  console.log(courseData);

  let profNames = ["Philip Ritchey", "Robert Lightfoot"];
  let courses = ["ENGR 102", "CSCE 121", "CSCE 221"];

  let queryTemplate = `query NewSearchTeachersQuery(\n  $query: TeacherSearchQuery!\n) {\n  newSearch {\n    teachers(query: $query) {\n      didFallback\n      edges {\n        cursor\n        node {\n          id\n          legacyId\n          firstName\n          lastName\n          department\n          school {\n            legacyId\n            name\n            id\n          }\n          avgRating\n          numRatings\n          wouldTakeAgainPercentRounded\n          mandatoryAttendance {\n            yes\n            no\n            neither\n            total\n          }\n          takenForCredit {\n            yes\n            no\n            neither\n            total\n          }\n          ratingsDistribution {\n            total\n            r1\n            r2\n            r3\n            r4\n            r5\n          }\n        }\n      }\n    }\n  }\n}`;

  for (let i = 0; i < profNames.length; i++) {
    let idReq = {
      query: queryTemplate,
      variables: {
        query: {
          text: profNames[i],
          schoolID: btoa("School-1003")
        }
      }
    };
    let rmpData = await fetch("https://www.ratemyprofessors.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Server": "istio-envoy",
        "Host": "www.ratemyprofessors.com",
        "Origin": "https://www.ratemyprofessors.com",
        "Referer": "https://www.ratemyprofessors.com/",
        "Cookie": "cid=vgk9Zhd3km-20231028; ccpa-notice-viewed-02=true",
        "Authorization": "Basic dGVzdDp0ZXN0"
      },
      body: JSON.stringify(idReq)
    }).then(res => res.json());
    let edges = rmpData.data.newSearch.teachers.edges;
    for (let i in Object.keys(rmpData.data.newSearch.teachers.edges)) {
      if (edges[i].node.school.id != btoa("School-1003")) {
        delete edges[i];
      }
    }
    profData[profNames[i]] = rmpData;
  }

  for (let i = 0; i < courses.length; i++) {
    let course = courses[i].split(" ");
    let anexData = await fetch(`https://anex.us/grades/getData/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Host": "anex.us",
        "Origin": "https://anex.us",
        "Referer": "https://anex.us/grades/"
      },
      body: `dept=${course[0]}&number=${course[1]}`
    }).then(res => res.json());
    gpaData[courses[i]] = anexData;
  }

  await fs.writeFile("course-data.json", JSON.stringify(courseData, null, 2));
  await fs.writeFile("prof-data.json", JSON.stringify(profData, null, 2));
  await fs.writeFile("gpa-data.json", JSON.stringify(gpaData, null, 2));
}

main();