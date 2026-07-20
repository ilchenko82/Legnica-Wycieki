@echo off
echo Deploying to https://github.com/ilchenko82/Legnica-Wycieki ...
git add .
git commit -m "Update Osuszanie & Wycieki site: phone +48577400943, 4-column pricing, Corroventa, Remmers, Jak dzialamy 5 steps"
git push -u origin main
echo Deploy complete!
