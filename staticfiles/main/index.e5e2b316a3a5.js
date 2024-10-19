function switchTab(tabName) {
    const tabs = {
        checklist: $("#checklist"),
        stats: $("#stats"),
        preferences: $("#preferences")
    };

    $.each(tabs, function(key, tab) {
        tab.toggleClass("hidden", key !== tabName);
    });
}

$(function() {
    let darkModeSwitch = $("#dark-mode-switch");
    let noCourseOutline = $("#no-course-outlines");
    let hideCourseIDSwitch = $("#hide-course-id-switch");

    let courseGridBoxes = $(".course-grid-box");

    if (firstVisit()) {
        initTutorial();
    }

    let summer = courseGridBoxes.slice(0, 4).addClass("summer");
    let online = courseGridBoxes.slice(-4).addClass("online");
    summer.addClass("outline-yellow-400");
    online.addClass("outline-blue-500");

    toggleSummer(summer);
    toggleOnline(online);

    $(".tooltip").each(function() {
        $(this).attr("title", $(this).attr("data-tooltip"));
    })

    removeDuplicateCategoryDivs();

    let loadedCourses = getParam("courses");
    if (loadedCourses != null) {
        loadedCourses = loadedCourses.split(",");
        let course = 0;

        courseGridBoxes.each(function() {
            if (loadedCourses[course] !== "n") {
                if (loadedCourses[course].startsWith("s")) {
                    triggerDrop({target: $(this)[0]}, true, loadedCourses[course].substring(1))
                    if (typeof loadedCourses[course + 1] !== undefined && loadedCourses[course + 1].startsWith("s")) {
                        triggerDrop({target: $(this)[0]}, true, loadedCourses[course + 1].substring(1))
                        course++;
                    }
                } else {
                    triggerDrop({target: $(this)[0]}, true, loadedCourses[course]);
                }
            }
            course++;
        })
    }

    $(".expand-btn").on("click", function() {
        let parent = $(this).parent().parent();
        parent.children("#description").toggleClass("hidden");
        parent.toggleClass("min-h-14 p-3");
        $(this).toggleClass("rotate-180 ml-1.5 ml-2");
    })

    $("#share-btn").on("click", function() {
        let courseIds = getCourseDict(true, true)["course_ids"];
        let url = returnParam("courses", courseIds);

        let modal = $("#modal-overlay");

        modal.removeClass("hidden");

        $("#close-modal").click(function() {
            modal.addClass('hidden');
        });

        modal.click(function(event) {
            if (event.target === this) {
                $(this).addClass('hidden');
            }
        });

        $("#export-input").val(url);
        window.history.replaceState(null, "", url);

    })

    $("#copy-share-url").on("click", function() {

        navigator.clipboard.writeText($("#export-input").val())
            .then(() => {
                $(this).children().first().attr("src", $("#copy-filled-src").val());

                setTimeout(() => {
                    $(this).children().first().attr("src", $("#copy-src").val());
                }, 1500);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });

    })

    $(".course-draggable").on("dragstart", function(ev) {
        ev.originalEvent.dataTransfer.setData("text", ev.target.id);
    })

    let courseContainers = $(".course-container");
    courseContainers.on("dragover", function(ev) {
        ev.preventDefault();
        ev.target.classList.add("outline-blue-400");
        ev.target.classList.remove("outline-black");
    })

    courseContainers.on("dragleave", function(ev) {
        ev.preventDefault();
        ev.target.classList.remove("outline-blue-400");
        if (isParamTrue("dark")) {
            ev.target.classList.add("outline-black");
        }
    })

    courseContainers.on("drop", function(ev) {
        ev.preventDefault();
        triggerDrop(ev);
    })

    if (isParamTrue("dark")) {
        darkModeSwitch.prop("checked", true);
        toggleDark();
    }

    if (isParamTrue("hide_course_ids")) {
        hideCourseIDSwitch.prop("checked", true);
        toggleCourseID();
    }

    $("#search-input").on("keyup", function (ev) {
        let searchTerm = $(this).val().toLowerCase().trim();
        $("#listbox .course-draggable").each(function () {
            if ($(this).attr("data-name").toLowerCase().trim().includes(searchTerm) || $(this).attr("id").includes(searchTerm) || $(this).attr("data-num").includes(searchTerm)) {
                $(this).removeClass("hidden");
            } else {
                $(this).addClass("hidden");
            }
        })
    })

    $("#arrow-nav").on("click", function() {

        let isOpen = $(this).data("open");

        $(this)
            .data("open", !isOpen)
            .toggleClass("rotate-180")
            .parent().animate({ "left": isOpen ? "18vw" : "0px" });

        let courseBoxes = $(".coursebox");
        courseBoxes.toggleClass("lg:w-[12vw] lg:mr-20");
        courseBoxes.first().parent().animate({ "left": isOpen ? "7.5vw" : "0px" });
    });

    $(".tab-btn").on("click", function() {
        switchTab($(this).data("tab"));
    });

    darkModeSwitch.on("change", function(){
        toggleUrlParam("dark", "true");
        toggleDark();
    });

    noCourseOutline.on("change", function(){
        toggleCourseOutlines();
    });

    hideCourseIDSwitch.on("change", function(){
        toggleUrlParam("hide_course_ids", "true");
        toggleCourseID();
    });
});

function toggleSummer(elem) {
    elem = $(elem);
    elem.toggleClass("flex items-center justify-center bg-yellow-200");
    elem.toggleClass("bg-gray-200");
    if (elem.find("#delete-me").length === 0) {
        elem.append("<p id='delete-me' class='group-hover:opacity-0 opacity-100 transition-opacity duration-500 no-drop'>Summer</p>");
    }
    else {
        elem.find("#delete-me").remove();
    }
    elem.toggleClass("outline-yellow-400");
}

function toggleOnline(elem) {
    elem = $(elem);
    elem.toggleClass("flex items-center justify-center bg-blue-200");
    elem.toggleClass("bg-gray-200");
    if (elem.find("#delete-me").length === 0) {
        elem.append("<p id='delete-me' class='group-hover:opacity-0 opacity-100 transition-opacity duration-500 no-drop'>Online</p>");
    }
    else {
        elem.find("#delete-me").remove();
    }
    elem.toggleClass("outline-blue-500");
}

function enableSummer(elem) {
    elem = $(elem);
    elem.removeClass("flex items-center justify-center bg-yellow-200");
    elem.addClass("bg-gray-200");
    elem.find("#delete-me").remove();
    elem.addClass("outline-yellow-400");
}

function enableOnline(elem) {
    elem = $(elem);
    elem.removeClass("flex items-center justify-center bg-blue-200");
    elem.addClass("bg-gray-200");
    elem.find("#delete-me").remove();
    elem.addClass("outline-blue-500");
}

function triggerDrop(ev, sim, simDropElem) {
    if (sim === undefined) {
        sim = false;
    }

    $(".course-grid-box").filter(function() {
        return !$(this).hasClass("summer") && !$(this).hasClass("online");
    }).each(function() {
        $(this).removeClass("outline-blue-400");
    });

    if (isParamTrue("dark")) {
        ev.target.classList.add("outline-black");
    }
    let droppedElemParent;
    let droppedElem;

    if (sim) {
        droppedElem = document.getElementById(simDropElem);
    } else {
        let data = ev.originalEvent.dataTransfer.getData("text");
        droppedElem = document.getElementById(data);
    }

    droppedElemParent = droppedElem.parentElement;

    if (ev.target.classList.contains("no-drop")) {
        if (hasParentWithId(ev.target, "listbox")) {

            ev.target = document.getElementById("listbox");

        } else if (hasParentWithClass(ev.target, "course-grid-box")) {

            ev.target = getParentWithClass(ev.target, "course-grid-box");

            calcCourseAmount(droppedElem, ev.target, "add");
        }
    } else {

        calcCourseAmount(droppedElem, ev.target, "add");

    }

    if (droppedElemParent.classList.contains("course-grid-box")) {

        calcCourseAmount(droppedElem, droppedElemParent, "sub");
        if (droppedElemParent.classList.contains("summer") && parseFloat(droppedElemParent.getAttribute("data-courses")) === 0.0) {
            toggleSummer(droppedElemParent);
        }
        else if (droppedElemParent.classList.contains("online") && parseFloat(droppedElemParent.getAttribute("data-courses")) === 0.0) {
            toggleOnline(droppedElemParent);
        }
    }

    if (parseFloat(ev.target.getAttribute("data-courses")) > 1.0) {
        calcCourseAmount(droppedElem, ev.target, "sub");
        return;
    }

    droppedElem.classList.add("h-[79.5%]");
    if (ev.target.classList.contains("course-grid-box")) {
        droppedElem.getElementsByClassName("expand-btn")[0].classList.add("hidden");
        droppedElem.getElementsByClassName("course-id")[0].classList.add("hidden");
        console.log(droppedElem.getAttribute("data-course-type"));
        if (!$("#no-course-outlines").prop("checked")) {
            courseOutline(droppedElem);
        }

        if (ev.target.classList.contains("summer")) {
            if (parseFloat(ev.target.getAttribute("data-courses")) === 0.5) {
                enableSummer(ev.target);
            }
            else if (parseFloat(ev.target.getAttribute("data-courses")) === 1.0) {
                enableSummer(ev.target);
            }
        }
        else if (ev.target.classList.contains("online")) {
            if (parseFloat(ev.target.getAttribute("data-courses")) === 0.5) {
                enableOnline(ev.target);
            }
            else if (parseFloat(ev.target.getAttribute("data-courses")) === 1.0) {
                enableOnline(ev.target);
            }
        }

        if (!droppedElem.getElementsByClassName("description")[0].classList.contains("hidden")) {
            droppedElem.getElementsByClassName("expand-btn")[0].click();
        }
        if (parseFloat(droppedElem.getAttribute("data-credit")) === 0.5) {
            droppedElem.classList.remove("min-h-14");
            droppedElem.classList.remove("m-2");
            if (parseFloat(ev.target.getAttribute("data-courses")) === 0.5) {
                droppedElem.classList.add("mt-1")
                droppedElem.classList.remove("rounded-lg")
                droppedElem.classList.add("rounded-t-lg")
                droppedElem.classList.remove("rounded-b-lg")
                droppedElem.classList.add("w-[90%]");
                droppedElem.classList.add("ml-2");
            } else {
                droppedElem.classList.remove("mt-1")
                droppedElem.classList.remove("rounded-lg")
                droppedElem.classList.remove("rounded-t-lg")
                droppedElem.classList.add("rounded-b-lg")
                droppedElem.classList.add("w-[90%]");
                droppedElem.classList.add("ml-2");
            }
            droppedElem.classList.add("max-h-9", "text-xs");
            droppedElem.getElementsByClassName("course-icons-info")[0].classList.add("hidden");

        }
    } else {
        formatForListbox(droppedElem);
    }

    if (ev.target.classList.contains("course-grid-box") && hasParentWithId(droppedElem, "listbox")) {
        let courses = getCourseIdsBeforeGrade(JSON.parse(droppedElem.getAttribute("data-grades")).pop())["course_ids"];
        let prereqIds = droppedElem.getAttribute("data-prereq-ids");
        let coreqIds = droppedElem.getAttribute("data-coreq-ids");
        let missingElements = [];
        let missingElementsOptional = false;


        if (prereqIds !== "None") {
            prereqIds = JSON.parse(prereqIds);
            let prereqs = prereqIds["required"];
            let prereqsOptional = prereqIds["optional"];

            missingElements = prereqs.filter(element => !courses.includes(element));
            missingElementsOptional = !courses.some(elem => prereqsOptional.includes(elem));
            if (missingElements.length === 1 && missingElements[0] === "") {
                missingElements = [];
            }
            if (prereqsOptional.length === 0) {
                missingElementsOptional = false;
            }
            if (droppedElem.getAttribute("data-name").includes("Math 3")) {
                if ($("#highest-math").val() === "geo") {
                    missingElements = [];
                }
            }

            else if (droppedElem.getAttribute("data-name").includes("Math 4")) {
                if ($("#highest-math").val() === "alg2") {
                    missingElements = []
                }
            }
            if (missingElements.length !== 0) {
                showRevertSnackbar(`You don't have the following listed course requirements for this course: ${missingElements}.`, droppedElem);
            }
            if (missingElementsOptional) {
                showRevertSnackbar(`You don't have at least <b>one</b> of the following course requirements (one or more needed): ${prereqIds["optional"]}.`, droppedElem);
            }

            if (droppedElem.getAttribute("data-name").includes("Res TJ")) {
                showInfoSnackbar("You just added a special course (maybe mentorship or a lab?). Prerequisites and corequisites for these courses are not checked. Please ensure you have all required requisites.");
            }
        }

        courses = getCourseIdsBeforeGrade(parseInt(JSON.parse(droppedElem.getAttribute("data-grades")).pop()) + 1)["course_ids"];

        if (coreqIds !== "None") {
            coreqIds = JSON.parse(coreqIds);
            let coreqs = coreqIds["required"];
            let coreqsOptional = coreqIds["optional"];

            missingElements = coreqs.filter(element => !courses.includes(element));
            missingElementsOptional = !courses.some(elem => coreqsOptional.includes(elem))
            if (missingElements.length === 1 && missingElements[0] === "") {
                missingElements = [];
            }

            if (coreqsOptional.length === 0) {
                missingElementsOptional = false;
            }

            if (missingElements.length !== 0) {
                showRevertSnackbar(`You don't have the following listed course requirements for this course <b>(they are PRE/COREQUIREMENTS)</b>: ${missingElements}.`, droppedElem);
            }
            if (missingElementsOptional) {
                showRevertSnackbar(`You don't have at least <b>one</b> of the following course requirements <b>(they are PRE/COREQUIREMENTS, one or more needed)</b>: ${coreqIds["optional"]}.`, droppedElem);
            }
        }

    }

    ev.target.appendChild(droppedElem);

    verification(droppedElem, ev.target);

    sortChildrenDivsById();
}

function toggleDark() {
    $("body").toggleClass("bg-gray-800");
    $("img").toggleClass("invert");
    $(".course-grid-box").addClass("outline-black").toggleClass("bg-gray-700");
    $("#prefs-box").toggleClass("bg-gray-600");
    $("#title-bar").toggleClass("bg-gray-600");
    $("input[type=checkbox]").toggleClass("bg-gray-500");
    $("p").toggleClass("text-white");
    $("label").toggleClass("text-white");
    $("#listbox").toggleClass("bg-gray-600 scrollbar-track-gray-500 scrollbar-track-gray-50");
    $("div").toggleClass("text-white");
    $(".course-draggable").toggleClass("bg-gray-800");
    $(".tab-btn").toggleClass("bg-gray-600 outline-black");
    $("#search-input").toggleClass("text-black");
    $("#modal-overlay").children().each(function() {
        $(this).children().each(function() {
            $(this).toggleClass("bg-gray-800");
        })
        $(this).toggleClass("bg-gray-800");
    });
    $("input").toggleClass("bg-gray-900");
    $("#copy-share-url").toggleClass("bg-gray-900");
    $("select").toggleClass("bg-gray-800");
    $(".summer p").toggleClass("text-white text-black");
}

function toggleCourseID() {
    $("#listbox .course-id").toggleClass("hidden");
}

function toggleUrlParam(param, value) {
    const url = new URL(window.location.href);

    if (url.searchParams.has(param)) {
        if (url.searchParams.get(param) === value) {
            url.searchParams.delete(param);
        } else {
            url.searchParams.set(param, value);
        }
    } else {
        url.searchParams.append(param, value);
    }

    window.history.replaceState(null, "", url);
}


function returnParam(param, value) {
    const url = new URL(window.location.href);

    if (url.searchParams.has(param)) {
        if (url.searchParams.get(param) === value) {
            url.searchParams.delete(param);
        } else {
            url.searchParams.set(param, value);
        }
    } else {
        url.searchParams.append(param, value);
    }

    return url;
}


function isParamTrue(param) {
    const url = new URL(window.location.href);

    const isParam = url.searchParams.get(param);

    return isParam === "true";
}

function getParam(param) {
    const url = new URL(window.location.href);

    return url.searchParams.get(param);
}

function hasParentWithId(element, id) {
    while (element) {
        if (element.id === id) {
            return true;
        }
        element = element.parentElement;
    }
    return false;
}

function hasParentWithClass(element, className) {
    while (element) {
        if (element.classList && element.classList.contains(className)) {
            return true;
        }
        element = element.parentElement;
    }
    return false;
}

function getParentWithClass(element, className) {
    while (element) {
        if (element.classList && element.classList.contains(className)) {
            return element;
        }
        element = element.parentElement;
    }
    throw "Couldn't find parent with class";
}

function sortChildrenDivsById() {
    let parent = document.getElementById("listbox");
    // get child divs
    let children = parent.querySelectorAll(".course-draggable, .category");

    let ids = [], obj, i, len;

    for (i = 0, len = children.length; i < len; i++) {
        obj = {};
        obj.element = children[i];
        obj.idNum = parseInt(children[i].getAttribute("data-sort").replace(/[^\d]/g, ""), 10);
        ids.push(obj);
    }

    ids.sort(function(a, b) {return(a.idNum - b.idNum);});

    // append in sorted order
    for (i = 0; i < ids.length; i++) {
         parent.appendChild(ids[i].element);
    }
}

function removeDuplicateCategoryDivs() {
    const seenTexts = new Set(); // To keep track of unique text content

    $("div .category").each(function() {
        const $div = $(this);
        const textContent = $div.text().trim(); // Get and trim the text content

        // Check if the text content has already been seen
        if (seenTexts.has(textContent)) {
            $div.remove(); // Remove the duplicate div
        } else {
            seenTexts.add(textContent); // Add the text content to the set
        }
    });
}

function verification(element, box) {
    verifyGrade(element, box);
    let reqs = verifyRequirements(getCourseDict());
    updateRequirements(reqs);
    updateStats(getCourseDict());
}

function verifyGrade(element, box) {
    const elementGrades = element.getAttribute('data-grades');
    const boxGrade = parseInt(box.getAttribute('data-grade'));

    if (elementGrades && boxGrade) {
        const gradesArray = JSON.parse(elementGrades);

        if (!gradesArray.includes(boxGrade)) {
            showRevertSnackbar(`This course is only offered in grades ${elementGrades}, but you placed it in ${boxGrade}th grade`, element);
        }
    }
}

function showRevertSnackbar(message, elem) {
    if ($("#no-snackbar").prop("checked")) {
        return false;
    }

     let random = Math.floor(Math.random() * 1000);

     $("body").append(
        `
        <div class="flex justify-center relative mt-10" id="snackbar${random}">
            <div class="bg-blue-400 w-1/3 min-h-14 rounded-lg flex items-center">
                <p class="text-white ml-3 items-start text-xs">${message}</p>
                <div class="flex ml-auto">
                    <button class="bg-gray-500 rounded-lg w-20 h-8 hover:bg-gray-600 transition-colors duration-300 text-white mr-3" id="snackbar-btn-dismiss${random}">Dismiss</button>
                    <button class="bg-red-400 rounded-lg w-20 h-8 hover:bg-red-500 transition-colors duration-300 text-white mr-3" id="snackbar-btn-revert${random}">Revert</button>
                </div>
            </div>
        </div>
        `
    );


    $("#snackbar" + random).animate({
        bottom: "+=8.5vh"
    }, 500);

    $("#snackbar-btn-dismiss" + random).on("click", function() {
        $(this).parent().parent().parent().fadeOut("normal", function() {
            $(this).remove();
        });
    });

    $("#snackbar-btn-revert" + random).on("click", function() {
        $(this).parent().parent().parent().remove();
        formatForListbox(elem);
        calcCourseAmount(elem, getParentWithClass(elem, "course-grid-box"), "sub");
        let reqs = verifyRequirements(getCourseDict());
        updateRequirements(reqs);
        $("#listbox").append(elem);

        sortChildrenDivsById();
    });
}

function showInfoSnackbar(message) {
     let random = Math.floor(Math.random() * 1000);

     $("body").append(
        `
        <div class="flex justify-center relative mt-10" id="snackbar${random}">
            <div class="bg-blue-400 w-1/3 min-h-14 rounded-lg flex items-center">
                <p class="text-white ml-3 items-start text-xs">${message}</p>
                <div class="flex ml-auto">
                    <button class="bg-gray-500 rounded-lg w-20 h-8 hover:bg-gray-600 transition-colors duration-300 text-white mr-3" id="snackbar-btn-dismiss${random}">Dismiss</button>
                </div>
            </div>
        </div>
        `
    );


    $("#snackbar" + random).animate({
        bottom: "+=8.5vh"
    }, 500);

    $("#snackbar-btn-dismiss" + random).on("click", function() {
        $(this).parent().parent().parent().fadeOut("normal", function() {
            $(this).remove();
        });
    });

}


function formatForListbox(elem) {
    elem.getElementsByClassName("expand-btn")[0].classList.remove("hidden");
    elem.getElementsByClassName("course-id")[0].classList.remove("hidden");
    elem.classList.add("min-h-14");
    elem.classList.add("m-2", "rounded-lg");
    elem.classList.remove("mt-1")
    elem.classList.remove("max-h-9", "text-xs", "h-[79.5%]", "rounded-b-lg", "rounded-t-lg");
    elem.getElementsByClassName("course-icons-info")[0].classList.remove("hidden");
    elem.classList.remove("text-xs");
    elem.classList.remove("w-[90%]");
    elem.classList.remove("ml-2");
    elem.classList.remove("outline", "outline-red-400", "outline-blue-600", "outline-yellow-400", "outline-orange-400", "outline-green-400", "outline-black");
}

function calcCourseAmount(elem, box, sign) {
    let boxCourses = parseFloat(box.getAttribute("data-courses"));
    let weight;

    if (sign === "sub") {
        weight = boxCourses - parseFloat(elem.getAttribute("data-credit"));
    } else {
        weight = boxCourses + parseFloat(elem.getAttribute("data-credit"));
    }


    box.setAttribute("data-courses", weight.toString());
}

function getCourseDict(returnNones, semAppendS) {
    if (returnNones === undefined) {
        returnNones = false;
    }
    if (semAppendS === undefined) {
        semAppendS = false;
    }

    let courses = {
        courses: [],
        course_ids: [],
    }
    let all_course_ids = []

    $(".course-grid-box").each(function() {
        $(this).children().each(function() {
            let id = 0;

            if ($(this).attr("id") !== "delete-me") {
                id = parseInt($(this).attr("id"));
            } else {
                return true;
            }

            let course = {
                id: id,
                name: $(this).attr("data-name"),
                credit: parseFloat($(this).attr("data-credit")),
                category: $(this).attr("data-category"),
                grade: parseInt($(this).parent().attr("data-grade")),
                type: $(this).attr("data-course-type"),
                weight: parseFloat($(this).attr("data-course-weight")),
            }
            if (course["credit"] === 0.5) {
                all_course_ids.push("s" + $(this).attr("id"));
            } else {
                all_course_ids.push($(this).attr("id"));
            }
            courses["courses"].push(course);
        })
        if (returnNones && $(this).children().length === 0) {
            all_course_ids.push("n");
        } else if (returnNones && $(this).children().length === 1 && ($(this).hasClass("summer") || $(this).hasClass("online"))) {
            all_course_ids.push("n");
        }
    })

    courses["course_ids"] = all_course_ids;
    return courses
}

function getCourseIdsBeforeGrade(grade) {
    let courses = {
        course_ids: [],
    }
    let all_course_ids = []

    $(".course-grid-box").each(function() {
        $(this).children().each(function() {
            if (parseInt($(this).parent().attr("data-grade")) < grade) {
                if ($(this).attr("id") !== "delete-me") {
                    all_course_ids.push($(this).attr("data-num"));
                } else {
                    return true;
                }
            }
        })
    })

    courses["course_ids"] = all_course_ids;
    return courses
}

function verifyRequirements(courseDict) {
    let requirements = {
        rs1: false, // rs1 first class      A
        ibet: false, // design and tech, bio, english 9         A
        science_courses: false, // post 9th science courses: chemistry, physics, geosystems        A
        hum: false, // english 10 and world history 2      A
        hum_two: false, // english 11 and us/va history       A
        comp_sci: false, // computer science before 11th        A
        world_lang: false, // at least 3 credits of one world lang     A
        epf: false, // economic and personal finance       A
        history_credit: false, // 4th history credit      A
        hpe: false, // hpe 2 credits 9/10th grade        A
        calc: false, // ap calc or ap calc bc            A
        credits: false // at least 26 credits            A
    }

    let chem = false;
    let physics = false;
    let geosystems = false;
    let hpe9 = false;
    let hpe10 = false;
    let worldHist2 = false;
    let eng10 = false;
    let usVaHist = false;
    let eng11 = false;
    let credits = 0
    let socialStudiesCredits = 0;
    let bio = false;
    let designAndTech = false;
    let english9 = false;
    let french = 0;
    let spanish = 0;
    let latin = 0;
    let chinese = 0;
    let german = 0;

    for (const course of courseDict["courses"]) {

        credits += course["credit"];

        if (course["name"].includes("Design and Tech") && course["grade"] < 11) {
            designAndTech = true;
        }

        else if (course["name"].includes("Biology") && course["grade"] === 9) {
            bio = true;
        }
        else if (course["name"].includes("English 9") && course["grade"] === 9) {
            english9 = true;
        }

        else if (course["name"].includes("Latin")) {
            latin++;
        }
        else if (course["name"].includes("French")) {
            french++;
        }
        else if (course["name"].includes("Spanish")) {
            spanish++;
        }
        else if (course["name"].includes("Chinese")) {
            chinese++;
        }
        else if (course["name"].includes("German")) {
            german++;
        }

        else if (course["name"].includes("Chemistry 1")) {
            chem = true;
        } else if (course["name"].includes("Physics")) {
            physics = true;
        } else if (course["name"].includes("Geosystems")) {
            geosystems = true;
        }

        else if (course["name"].includes("Health & PE 9") && course["grade"] === 9) {
            hpe9 = true;
        } else if (course["name"].includes("Health & PE 10") && course["grade"] === 10) {
            hpe10 = true;
        }

        else if (course["name"].includes("World Hist") && course["name"].includes("2") && course["grade"] === 10) {
            socialStudiesCredits += course["credit"];
            worldHist2 = true;
        } else if (course["name"].includes("English 10") && course["grade"] === 10) {
            eng10 = true;
        }

        else if (course["name"].includes("US VA") && 12 > course["grade"] > 9) {
            socialStudiesCredits += course["credit"];
            usVaHist = true;
        } else if (course["name"].includes("English 11") && course["grade"] === 11) {
            eng11 = true;
        }

        else if (course["name"].includes("Found Comp Sci") && course["grade"] < 11) {
            requirements["comp_sci"] = true;
        }

        else if (course["name"].includes("AP Calc")) {
            requirements["calc"] = true;
        }

        else if (course["name"].includes("Econ")) {
            requirements["epf"] = true;
        }

        else if (course["category"] === "Social Studies") {
            socialStudiesCredits += course["credit"];
        }


    }

    if (chem && physics && geosystems) {
        requirements["science_courses"] = true;
    }

    if (hpe9 && hpe10) {
        requirements["hpe"] = true;
    }

    if (worldHist2 && eng10) {
        requirements["hum"] = true;
    }

    if (credits >= 26) {
        requirements["credits"] = true;
    }

    if (socialStudiesCredits >= 4) {
        requirements["history_credit"] = true;
    }

    if (bio && designAndTech && english9) {
        requirements["ibet"] = true;
    }

    if (latin >= 3 || spanish >= 3 || chinese >= 3 || french >= 3 || german >= 3) {
        requirements["world_lang"] = true;
    }

    requirements["rs1"] = rs1First(courseDict);

    return requirements;
}

function updateRequirements(reqs) {
    for (const key in reqs) {
        document.getElementById(key).checked = reqs[key];
    }
}

function rs1First(courseDict) {
    let rs1Found = false;

    for (const course of courseDict["courses"]) {
        if (!(course["id"] === "3190T1" || course["name"].includes("Research Stat 1")) && course["category"] === "Mathematics") {
            return false;
        }
        if ((course["id"] === "3190T1" || course["name"].includes("Research Stat 1"))) {
            rs1Found = true;
        }
    }

    return rs1Found;
}

function updateStats(courseDict) {
    let credit = 0.0;
    let aps = 0;
    let hns = 0;
    let weights = [];
    let cats = {};

    for (const course of courseDict["courses"]) {
        credit += course["credit"];

        if (course["type"] === "HN") {
            hns++;
        }
        else if (course["type"] === "AP") {
            aps++;
        }

        weights.push(4.0 + course["weight"]);

        if (!(course["category"] in cats)) {
            cats[course["category"]] = 0;
        }

        cats[course["category"]] += 1;
    }

    $(".category-stat").each(function () {
        $(this).html($(this).html().replace(/\d+/g, '') + 0);
        $(this).addClass("hidden");
    })

    for (const cat in cats) {
        let elem = $(`b:contains('${cat}'):last`).parent();
        elem.html(elem.html().replace(/\d+/g, '') + cats[cat]);
        elem.removeClass("hidden");
    }

    $("#course-count").text(`${courseDict["courses"].length} (${credit} credits)`);
    $("#hn-count").text(hns);
    $("#ap-count").text(aps);

    let sum = weights.reduce((acc, curr) => acc + curr, 0);
    let average = sum / weights.length;
    let bAverage = getAverageAssumingBs(weights);

    let msGpa = $("#ms-gpa-input").val();

    if (msGpa !== "") {
        average = (parseInt(msGpa) + average) / (weights.length + 1);
        bAverage = (parseInt(msGpa) + bAverage) / (weights.length + 1);
    }

    $("#max-gpa").text(average.toFixed(2));
    $("#achievable-gpa").text(bAverage.toFixed(2));
}

function getAverageAssumingBs(weights) {

    let numToModify = Math.ceil(weights.length * 0.2);

    let indices = new Set();
    while (indices.size < numToModify) {
        const randomIndex = Math.floor(Math.random() * weights.length);
        indices.add(randomIndex);
    }

    indices.forEach(index => {
        weights[index] -= 1.0;
    });

    let sum = weights.reduce((acc, curr) => acc + curr, 0);

    return sum / weights.length;
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function firstVisit() {
    let visited = getCookie("visited");
    if (!visited) {
        setCookie("visited", "true", 365);
        return true;
    } else {
        return false;
    }
}

function initTutorial() {
    let tutorial = $("#tutorial").removeClass("hidden");
    let t1 = $("#t1");
    let t2 = $("#t2");
    let t3 = $("#t3");

    t1.removeClass("hidden");

    $("#t1-next").on("click", function() {
        t1.remove();
        t2.removeClass("hidden");
    })

    $("#t2-next").on("click", function() {
        t2.remove();
        t3.removeClass("hidden");
    })

    $("#t3-next").on("click", function() {
        tutorial.remove();
    })
}

function toggleCourseOutlines() {
    $(".course-grid-box .course-draggable").each(function () {
        courseOutline($(this)[0], true);
    })
}

function courseOutline(droppedElem, toggle) {
    if (toggle === undefined) {
        toggle = false;
    }
    if (droppedElem.getAttribute("data-course-type") === "AP") {
        if (toggle) {
            droppedElem.classList.toggle("outline")
            droppedElem.classList.toggle("outline-red-400");
        } else {
            droppedElem.classList.add("outline", "outline-red-400")
        }
    }
    else if (droppedElem.getAttribute("data-course-type") === "HN") {
        if (toggle) {
            droppedElem.classList.toggle("outline")
            droppedElem.classList.toggle("outline-yellow-400");
        } else {
            droppedElem.classList.add("outline", "outline-yellow-400")
        }
    }
    else if (droppedElem.getAttribute("data-course-type") === "POST") {
        if (toggle) {
            droppedElem.classList.toggle("outline")
            droppedElem.classList.toggle("outline-blue-600");
        } else {
            droppedElem.classList.add("outline", "outline-blue-600")
        }
    }
    else if (droppedElem.getAttribute("data-course-type") === "IB") {
        if (toggle) {
            droppedElem.classList.toggle("outline")
            droppedElem.classList.toggle("outline-orange-400");
        } else {
            droppedElem.classList.add("outline", "outline-orange-400")
        }
    }
    else if (droppedElem.getAttribute("data-course-type") === "DE") {
        if (toggle) {
            droppedElem.classList.toggle("outline")
            droppedElem.classList.toggle("outline-green-400");
        } else {
            droppedElem.classList.add("outline", "outline-green-400")
        }
    }
    else if (droppedElem.getAttribute("data-course-type") === "NONE") {
        if (toggle) {
            droppedElem.classList.toggle("outline")
            droppedElem.classList.toggle("outline-black");
        } else {
            droppedElem.classList.add("outline", "outline-black")
        }
    }
}