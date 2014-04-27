#!/bin/bash
files=(
    index.html
    main.js
    style.css
)

for file in "${files[@]}"; do
    s3cmd sync -P --no-progress "$file" s3://mockbrian.com/13th-age/point-buy/
done
