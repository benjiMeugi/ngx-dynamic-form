
yalc publish

rm -rf dist/ngx-dynamic-form && ng build ngx-dynamic-form && cd dist/ngx-dynamic-form && yalc push && cd ../..

rm -rf dist/ngx-dynamic-form && rm -rf .angular && ng build ngx-dynamic-form && yalc publish

yalc push