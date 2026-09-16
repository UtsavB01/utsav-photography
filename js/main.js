/*
  UTSAV BISWAS — ARCHIVE / HOMEPAGE LOGIC

  Photography:
  - photos are defined in data/photos.js
  - set featured: true manually for photographs you want on the homepage
  - the archive displays every photo in the manifest
  - 50 photographs maximum per archive page

  Activities:
  - activities are defined in data/activities.js
  - set featured: true manually for posters you want on the homepage
  - the complete collection is displayed on activities.html
*/

(function () {
  "use strict";

  const PAGE_SIZE = 50;
  const MAX_FEATURED_PHOTOS = 6;
  const MAX_FEATURED_ACTIVITIES = 6;

  const photoData = Array.isArray(window.photos) ? window.photos : [];
  const activityData = Array.isArray(window.activities) ? window.activities : [];

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const photoId = (photo, index) =>
    photo.id || `${photo.category || "photo"}-${index + 1}`;

  const activityYear = (activity) =>
    String(activity.year || activity.date || "Other").slice(0, 4);


  /* ==========================================================
     HOMEPAGE — SELECTED WORK
     ========================================================== */

  const selectedGrid = document.getElementById("selected-work-grid");

  if (selectedGrid) {

    const featured = photoData
      .filter(photo => photo.featured === true)
      .slice(0, MAX_FEATURED_PHOTOS);

    featured.forEach((photo, index) => {

      const sizeClass =
        index === 0 ? "selected-large" :
        index === 1 ? "selected-small" :
        "selected-extra";

      const link = document.createElement("a");

      link.className = sizeClass;

      link.href =
        `portfolio.html?category=${encodeURIComponent(photo.category)}&photo=${encodeURIComponent(photoId(photo, index))}`;

      link.innerHTML = `
        <img
          src="${escapeHtml(photo.file)}"
          alt="${escapeHtml(photo.title)}"
          loading="${index < 2 ? "eager" : "lazy"}"
        >

        <span class="selected-caption">
          <span class="image-label">
            ${escapeHtml(photo.category)}
          </span>
        </span>
      `;

      selectedGrid.appendChild(link);

    });


    if (featured.length === 0) {

      selectedGrid.innerHTML = `
        <div class="archive-empty">
          Select photographs in <strong>data/photos.js</strong>
          by setting <strong>featured: true</strong>.
        </div>
      `;

    }

  }


  /* ==========================================================
     HOMEPAGE — ACTIVITIES
     ========================================================== */

  const activitiesGrid = document.getElementById("activities-grid");

  if (activitiesGrid) {

    const featuredActivities = activityData
      .filter(activity => activity.featured === true)
      .slice(0, MAX_FEATURED_ACTIVITIES);

    featuredActivities.forEach(activity => {

      const card = document.createElement("a");

      card.className = "activity-card";
      card.href = "activities.html";

      card.innerHTML = `
        <div class="activity-image">

          <img
            src="${escapeHtml(activity.file)}"
            alt="${escapeHtml(activity.alt || activity.title)}"
            loading="lazy"
          >

        </div>

        <span class="activity-card-caption">

          <span class="activity-title">
            ${escapeHtml(activity.title)}
          </span>

          <span class="activity-date">
            ${escapeHtml(activity.date)}
          </span>

        </span>
      `;

      activitiesGrid.appendChild(card);

    });

  }


  /* ==========================================================
     PORTFOLIO ARCHIVE
     ========================================================== */

  const gallery = document.getElementById("gallery");

  if (gallery) {

    const filters = document.getElementById("filters");
    const count = document.getElementById("archive-count");
    const title = document.getElementById("archive-title");
    const description = document.getElementById("archive-description");
    const featuredPhoto = document.getElementById("featured-photo");
    const photoCategory = document.getElementById("photo-category");
    const photoTitle = document.getElementById("photo-title");
    const photoLocation = document.getElementById("photo-location");
    const previous = document.getElementById("previous-photo");
    const next = document.getElementById("next-photo");
    const gridTitle = document.getElementById("grid-title");
    const pageLabel = document.getElementById("page-label");
    const pagination = document.getElementById("pagination");

    const params = new URLSearchParams(window.location.search);

    let requestedCategory = params.get("category") || "All";
    let requestedPhoto = params.get("photo") || "";

    let requestedPage =
      parseInt(params.get("page") || "1", 10);

    if (
      !Number.isFinite(requestedPage) ||
      requestedPage < 1
    ) {
      requestedPage = 1;
    }


    const categories = [
      "All",
      ...new Set(
        photoData
          .map(photo => photo.category)
          .filter(Boolean)
      )
    ];


    if (!categories.includes(requestedCategory)) {
      requestedCategory = "All";
    }


    function photosForCategory(category) {

      return category === "All"
        ? photoData
        : photoData.filter(
            photo => photo.category === category
          );

    }


    function makeUrl(category, photo, page) {

      const query = new URLSearchParams();

      if (
        category &&
        category !== "All"
      ) {
        query.set("category", category);
      }

      if (photo) {

        query.set(
          "photo",
          photoId(
            photo,
            photoData.indexOf(photo)
          )
        );

      }

      if (page && page > 1) {
        query.set("page", String(page));
      }

      const queryString = query.toString();

      return `portfolio.html${
        queryString ? `?${queryString}` : ""
      }`;

    }


    function setActiveFilter(category) {

      document
        .querySelectorAll(".filter")
        .forEach(button => {

          button.classList.toggle(
            "active",
            button.dataset.category === category
          );

        });

    }


    function renderFilters() {

      filters.innerHTML = "";

      categories.forEach(category => {

        const button =
          document.createElement("button");

        button.type = "button";

        button.className =
          "filter" +
          (
            category === requestedCategory
              ? " active"
              : ""
          );

        button.dataset.category = category;

        button.textContent = category;

        button.addEventListener(
          "click",
          () => {

            const url =
              category === "All"
                ? "portfolio.html"
                : `portfolio.html?category=${encodeURIComponent(category)}`;

            window.location.href = url;

          }
        );

        filters.appendChild(button);

      });

    }


    function findPhotoById(id) {

      if (!id) return null;

      return photoData.find(
        (photo, index) =>
          photoId(photo, index) === id
      ) || null;

    }


    function renderPagination(
      totalPages,
      currentPage
    ) {

      pagination.innerHTML = "";

      if (totalPages <= 1) return;


      const addPage =
        (
          label,
          page,
          active = false
        ) => {

          const link =
            document.createElement("a");

          link.href =
            makeUrl(
              requestedCategory,
              null,
              page
            );

          link.textContent = label;

          if (active) {
            link.className = "active";
          }

          pagination.appendChild(link);

        };


      if (currentPage > 1) {
        addPage("←", currentPage - 1);
      }


      const pages = [];


      if (totalPages <= 7) {

        for (
          let i = 1;
          i <= totalPages;
          i++
        ) {
          pages.push(i);
        }

      } else {

        pages.push(1);

        if (currentPage > 4) {
          pages.push("…");
        }

        const start =
          Math.max(
            2,
            currentPage - 2
          );

        const end =
          Math.min(
            totalPages - 1,
            currentPage + 2
          );

        for (
          let i = start;
          i <= end;
          i++
        ) {
          pages.push(i);
        }

        if (
          currentPage <
          totalPages - 3
        ) {
          pages.push("…");
        }

        pages.push(totalPages);

      }


      pages.forEach(page => {

        if (page === "…") {

          const span =
            document.createElement("span");

          span.className = "ellipsis";
          span.textContent = "…";

          pagination.appendChild(span);

        } else {

          addPage(
            String(page),
            page,
            page === currentPage
          );

        }

      });


      if (currentPage < totalPages) {
        addPage(
          "→",
          currentPage + 1
        );
      }

    }


    function renderArchive() {

      const filtered =
        photosForCategory(
          requestedCategory
        );

      const total = filtered.length;

      const totalPages =
        Math.max(
          1,
          Math.ceil(
            total / PAGE_SIZE
          )
        );


      requestedPage =
        Math.min(
          requestedPage,
          totalPages
        );


      const pageStart =
        (requestedPage - 1) *
        PAGE_SIZE;


      const pagePhotos =
        filtered.slice(
          pageStart,
          pageStart + PAGE_SIZE
        );


      const requestedSelected =
        findPhotoById(
          requestedPhoto
        );


      const selected =
        requestedSelected &&
        (
          requestedCategory === "All" ||
          requestedSelected.category ===
            requestedCategory
        )
          ? requestedSelected
          : pagePhotos[0] ||
            filtered[0] ||
            null;


      if (requestedCategory === "All") {

        title.textContent =
          "Portfolio";

        gridTitle.textContent =
          "Photographs";

      } else {

        title.textContent =
          requestedCategory;

        gridTitle.textContent =
          requestedCategory;

      }


      description.textContent =
        "A growing collection of photographs from the field. Browse by subject; the archive will become more detailed as it grows.";


      count.textContent =
        `${total} photograph${
          total === 1
            ? ""
            : "s"
        }`;


      pageLabel.textContent =
        total
          ? `Page ${requestedPage} of ${totalPages}`
          : "No photographs";


      if (selected) {

        featuredPhoto.src =
          selected.file;

        featuredPhoto.alt =
          selected.title ||
          selected.category ||
          "Nature photograph";


        photoCategory.textContent =
          selected.category || "";


        photoTitle.textContent =
          selected.title || "";


        photoLocation.textContent =
          selected.location || "";


        const selectedIndex =
          filtered.indexOf(
            selected
          );


        if (selectedIndex > 0) {

          previous.classList.remove(
            "disabled"
          );

          previous.href =
            makeUrl(
              requestedCategory,
              filtered[
                selectedIndex - 1
              ],
              Math.floor(
                (selectedIndex - 1) /
                PAGE_SIZE
              ) + 1
            );

        } else {

          previous.classList.add(
            "disabled"
          );

          previous.removeAttribute(
            "href"
          );

        }


        if (
          selectedIndex <
          filtered.length - 1
        ) {

          next.classList.remove(
            "disabled"
          );

          next.href =
            makeUrl(
              requestedCategory,
              filtered[
                selectedIndex + 1
              ],
              Math.floor(
                (selectedIndex + 1) /
                PAGE_SIZE
              ) + 1
            );

        } else {

          next.classList.add(
            "disabled"
          );

          next.removeAttribute(
            "href"
          );

        }

      } else {

        featuredPhoto.removeAttribute(
          "src"
        );

        featuredPhoto.alt = "";

        photoCategory.textContent = "";

        photoTitle.textContent =
          "No photographs yet";

        photoLocation.textContent =
          "Add photographs to data/photos.js to populate the archive.";

        previous.classList.add(
          "disabled"
        );

        next.classList.add(
          "disabled"
        );

        previous.removeAttribute(
          "href"
        );

        next.removeAttribute(
          "href"
        );

      }


      gallery.innerHTML = "";


      pagePhotos.forEach(
        (photo, pageIndex) => {

          const absoluteIndex =
            pageStart +
            pageIndex;


          const link =
            document.createElement("a");

          link.className =
            "photo-card";


          link.href =
            makeUrl(
              requestedCategory,
              photo,
              Math.floor(
                absoluteIndex /
                PAGE_SIZE
              ) + 1
            );


          link.innerHTML = `
            <img
              src="${escapeHtml(photo.file)}"
              alt="${escapeHtml(
                photo.title ||
                photo.category ||
                "Nature photograph"
              )}"
              loading="lazy"
            >

            <span class="photo-card-caption">

              <strong>
                ${escapeHtml(
                  photo.title || ""
                )}
              </strong>

              <br>

              <small>
                ${escapeHtml(
                  photo.location || ""
                )}
              </small>

            </span>
          `;


          gallery.appendChild(link);

        }
      );


      if (
        pagePhotos.length === 0
      ) {

        gallery.innerHTML = `
          <div class="archive-empty">
            No photographs have been added to this category yet.
          </div>
        `;

      }


      renderPagination(
        totalPages,
        requestedPage
      );

      setActiveFilter(
        requestedCategory
      );

    }


    renderFilters();
    renderArchive();

  }


  /* ==========================================================
     ACTIVITIES ARCHIVE
     ========================================================== */

  const activitiesArchive =
    document.getElementById(
      "activities-archive"
    );


  if (activitiesArchive) {

    const grouped = {};


    activityData.forEach(
      activity => {

        const year =
          activityYear(
            activity
          );

        if (!grouped[year]) {
          grouped[year] = [];
        }

        grouped[year].push(
          activity
        );

      }
    );


    const years =
      Object.keys(grouped)
        .sort(
          (a, b) =>
            String(b).localeCompare(
              String(a)
            )
        );


    years.forEach(
      year => {

        const section =
          document.createElement(
            "section"
          );

        section.className =
          "activity-year";


        const heading =
          document.createElement(
            "div"
          );

        heading.className =
          "activity-year-heading";


        heading.innerHTML = `
          <h2>
            ${escapeHtml(year)}
          </h2>

          <span>
            ${grouped[year].length}
            activit${
              grouped[year].length === 1
                ? "y"
                : "ies"
            }
          </span>
        `;


        const grid =
          document.createElement(
            "div"
          );

        grid.className =
          "activities-archive-grid";


        grouped[year].forEach(
          activity => {

            const card =
              document.createElement(
                "figure"
              );

            card.className =
              "activity-card";


            card.innerHTML = `
              <div class="activity-image">

                <img
                  src="${escapeHtml(
                    activity.file
                  )}"
                  alt="${escapeHtml(
                    activity.alt ||
                    activity.title
                  )}"
                  loading="lazy"
                >

              </div>

              <figcaption>

                <span class="activity-title">
                  ${escapeHtml(
                    activity.title
                  )}
                </span>

                <span class="activity-date">
                  ${escapeHtml(
                    activity.date
                  )}
                </span>

              </figcaption>
            `;


            grid.appendChild(
              card
            );

          }
        );


        section.appendChild(
          heading
        );

        section.appendChild(
          grid
        );

        activitiesArchive.appendChild(
          section
        );

      }
    );

  }

})();
