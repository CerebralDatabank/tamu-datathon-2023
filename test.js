const fs = require("fs").promises;

async function main() {
  let profNames = ["Philip Ritchey"];

  let queryTemplate =
  `query NewSearchTeachersQuery(
    $query: TeacherSearchQuery!
  ) {
    newSearch {
      teachers(query: $query) {
        didFallback
        edges {
          cursor
          node {
            id
            legacyId
            firstName
            lastName
            department
            school {
              legacyId
              name
              id
            }
            avgRating
            numRatings
            wouldTakeAgainPercentRounded
            mandatoryAttendance {
              yes
              no
              neither
              total
            }
            takenForCredit {
              yes
              no
              neither
              total
            }
            ratingsDistribution {
              total
              r1
              r2
              r3
              r4
              r5
            }
          }
        }
      }
    }
  }`;

  for (let i = 0; i < profNames.length; i++) {
    // let cookieResponse = await fetch("https://www.ratemyprofessors.com/", {
    //   method: "GET",
    //   headers: {
    //     "Host": "www.ratemyprofessors.com",
    //     "Origin": "https://www.ratemyprofessors.com",
    //     "Referer": "https://www.ratemyprofessors.com/"
    //   },
    // });
    // let cookie = cookieResponse.headers;
    // console.log(cookie);
    // return;
    let idReq = {
      query: queryTemplate,
      variables: {
        query: {
          text: profNames[i],
          schoolID: btoa("School-1003")
        }
      }
    };
    let response = await fetch("https://www.ratemyprofessors.com/graphql", {
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
    }).then(res => res.text());
    console.log(response);
  }
}

main();