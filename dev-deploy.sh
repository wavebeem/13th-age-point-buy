#!/bin/bash
files=(
    index.html
    *.js
    *.css
)

for file in "${files[@]}"; do
    s3cmd sync -P --no-progress "$file" s3://dev.mockbrian.com/13th-age/point-buy/
done
