#!/bin/zsh
set -e
cd /Users/jonanthonyflores/elysia-landing

TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill 2>/dev/null | sed -n 's/^password=//p')
OWNER=DryestRain777
REPO=elysia-landing

echo "== Ensuring repo exists =="
EXISTS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "https://api.github.com/repos/$OWNER/$REPO")
echo "repo_check_status=$EXISTS"
if [ "$EXISTS" != "200" ]; then
  curl -s -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
    https://api.github.com/user/repos \
    -d '{"name":"elysia-landing","description":"ELYSIA premium landing page by El BioSci","homepage":"https://dryestrain777.github.io/elysia-landing/","private":false,"has_wiki":false}' \
    -o /tmp/ghrepo.json
  python3 -c "import json;d=json.load(open('/tmp/ghrepo.json'));print('created='+str(d.get('full_name'))+' err='+str(d.get('message')))"
fi

echo "== Configuring git remote =="
git config user.name >/dev/null 2>&1 || git config user.name "DryestRain777"
git config user.email >/dev/null 2>&1 || git config user.email "DryestRain777@users.noreply.github.com"
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "https://github.com/$OWNER/$REPO.git"
else
  git remote add origin "https://github.com/$OWNER/$REPO.git"
fi

# Make sure everything is committed
git add -A
git commit -m "Deploy Elysia landing page" >/dev/null 2>&1 || echo "nothing-to-commit"

echo "== Pushing to GitHub =="
git push -u origin main 2>&1

echo "== Enabling GitHub Pages (GitHub Actions source) =="
PAGES_STATUS=$(curl -s -o /tmp/ghpages.json -w "%{http_code}" -X POST \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$OWNER/$REPO/pages" \
  -d '{"build_type":"workflow"}')
echo "pages_post_status=$PAGES_STATUS"
if [ "$PAGES_STATUS" = "409" ] || [ "$PAGES_STATUS" = "400" ]; then
  curl -s -o /tmp/ghpages.json -w "pages_put_status=%{http_code}\n" -X PUT \
    -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$OWNER/$REPO/pages" \
    -d '{"build_type":"workflow"}'
fi

echo "== DONE =="
echo "repo=https://github.com/$OWNER/$REPO"
echo "pages=https://dryestrain777.github.io/$REPO/"
