const addBox = document.querySelector(".add-box"),
    noteWrapper = document.querySelector(".notes-list"),
    popupBox = document.querySelector(".popup-box"),
    popupTitle = popupBox.querySelector("header p"),
    closeIcon = popupBox.querySelector("header i"),
    titleTag = popupBox.querySelector("input"),
    descTag = popupBox.querySelector("textarea"),
    addBtn = popupBox.querySelector("button");

const months = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
const notes = JSON.parse(localStorage.getItem("notes") || "[]");
let isUpdate = false, updateId;

addBox.addEventListener("click", () => {
    popupTitle.innerText = "Add a new Note";
    addBtn.innerText = "Add Note";
    popupBox.classList.add("show");
    document.querySelector("body").style.overflow = "hidden";
    if (window.innerWidth > 660) titleTag.focus();
});

closeIcon.addEventListener("click", () => {
    isUpdate = false;
    titleTag.value = descTag.value = "";
    popupBox.classList.remove("show");
    document.querySelector("body").style.overflow = "auto";
});

function showNotes() {
    if (!notes) return;
    document.querySelectorAll(".note").forEach(li => li.remove());
    notes.forEach((note, id) => {
        let filterDesc = note.description.replaceAll("\n", '<br/>');
        let liTag = `<li class="note">
                        <div class="details">
                            <p>${note.title}</p>
                            <span>${filterDesc}</span>
                        </div>
                        <div class="bottom-content">
                            <span>${note.date}</span>
                            <div class="settings">
                                <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
                                <ul class="menu">
                                <li onclick="pinNote(${id}, '${note}')"><i class="uil uil-map-pin-alt"></i>Pin</li>
                                    <li onclick="updateNote(${id}, '${note.title}', '${filterDesc}')"><i class="uil uil-pen"></i>Edit</li>
                                    <li onclick="deleteNote(${id})"><i class="uil uil-trash"></i>Delete</li>
                                </ul>
                            </div>
                        </div>
                    </li>`;
        noteWrapper.insertAdjacentHTML("afterend", liTag);
    });
}
showNotes();

function showMenu(elem) {
    elem.parentElement.classList.add("show");
    document.addEventListener("click", e => {
        if (e.target.tagName != "I" || e.target != elem) {
            elem.parentElement.classList.remove("show");
        }
    });
}

function pinNote(id) {
    location.reload();
    let pinNote = notes.splice(id, 1)[0];
    notes.push(pinNote);
    localStorage.setItem("notes", JSON.stringify(notes));
    showNotes();
}

function deleteNote(noteId) {
    location.reload();
    notes.splice(noteId, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    showNotes();
}

function updateNote(noteId, title, filterDesc) {
    let description = filterDesc.replaceAll('<br/>', '\r\n');
    updateId = noteId;
    isUpdate = true;
    addBox.click();
    titleTag.value = title;
    descTag.value = description;
    popupTitle.innerText = "Update a Note";
    addBtn.innerText = "Update Note";
}

addBtn.addEventListener("click", e => {
    location.reload();
    e.preventDefault();
    let title = titleTag.value.trim(),
        description = descTag.value.trim();

    if (title || description) {
        let currentDate = new Date(),
            month = months[currentDate.getMonth()],
            day = currentDate.getDate(),
            year = currentDate.getFullYear();

        let noteInfo = { title, description, date: `${month} ${day}, ${year}` }
        if (!isUpdate) {
            notes.push(noteInfo);
        } else {
            isUpdate = false;
            notes[updateId] = noteInfo;
        }
        localStorage.setItem("notes", JSON.stringify(notes));
        showNotes();
        closeIcon.click();
    }
});

if ($(".wrapper").children().length < 8) {
    console.log("yes");
    $(".wrapper").addClass("pagination-items");
} else {
    console.log("no");
    $(".wrapper").removeClass("pagination-items");
}


// Pagination
(function ($) {

    var paginate = {
        startPos: function (pageNumber, perPage) {
            return pageNumber * perPage;
        },

        getPage: function (items, startPos, perPage) {
            var page = [];

            items = items.slice(startPos, items.length);

            for (var i = 0; i < perPage; i++) {
                page.push(items[i]);
            }

            return page;
        },

        totalPages: function (items, perPage) {
            return Math.ceil(items.length / perPage);
        },

        createBtns: function (totalPages, currentPage) {
            var pagination = $('<div class="pagination" />');

            pagination.append('<span class="pagination-button">&laquo;</span>');

            for (var i = 1; i <= totalPages; i++) {
                if (totalPages > 5 && currentPage !== i) {
                    if (currentPage === 1 || currentPage === 2) {
                        if (i > 5) continue;
                    } else if (currentPage === totalPages || currentPage === totalPages - 1) {
                        if (i < totalPages - 4) continue;
                    } else {
                        if (i < currentPage - 2 || i > currentPage + 2) {
                            continue;
                        }
                    }
                }

                var pageBtn = $('<span class="pagination-button page-num" />');

                if (i == currentPage) {
                    pageBtn.addClass('active');
                }

                pageBtn.text(i);

                pagination.append(pageBtn);
            }

            pagination.append($('<span class="pagination-button">&raquo;</span>'));

            return pagination;
        },

        createPage: function (items, currentPage, perPage) {
            $('.pagination').remove();

            var container = items.parent(),
                items = items.detach().toArray(),
                startPos = this.startPos(currentPage - 1, perPage),
                page = this.getPage(items, startPos, perPage);

            $.each(page, function () {
                if (this.window === undefined) {
                    container.append($(this));
                }
            });

            var totalPages = this.totalPages(items, perPage),
                pageButtons = this.createBtns(totalPages, currentPage);

            container.after(pageButtons);
        }
    };

    $.fn.paginate = function (perPage) {
        var items = $(this);

        if (isNaN(perPage) || perPage === undefined) {
            perPage = 5;
        }

        if (items.length <= perPage) {
            return true;
        }

        if (items.length !== items.parent()[0].children.length) {
            items.wrapAll('<div class="pagination-items" />');
        }

        paginate.createPage(items, 1, perPage);

        $(document).on('click', '.pagination-button', function (e) {
            var currentPage = parseInt($('.pagination-button.active').text(), 10),
                newPage = currentPage,
                totalPages = paginate.totalPages(items, perPage),
                target = $(e.target);

            newPage = parseInt(target.text(), 10);
            if (target.text() == '«') newPage = 1;
            if (target.text() == '»') newPage = totalPages;

            if (newPage > 0 && newPage <= totalPages) {
                paginate.createPage(items, newPage, perPage);
            }
        });
    };

})(jQuery);

$('.note').paginate(6);