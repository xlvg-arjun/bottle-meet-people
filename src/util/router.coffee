routerPatcher = () ->
  # window.location.pathname = "/#/"
  userProfileRegex = /^\/#\/user\/([0-9]+)\/?/ig
  hashRouteRegex = /^\/#\/.*/
  currentPath = window.location.pathname
  console.log(currentPath)
  switch currentPath
    when "/#/" then "redirect to login if not logged in"
    when "/#/login" then "ha"
    when "/#/profile" then "check if in profile"
    else
      if userProfileRegex.test(currentPath)
        profileId = currentPath.match(userProfileRegex)[0]
        "I need to give a profile here based on this"
      else if not hashRouteRegex.test(currentPath)
        window.location.replace('/#/')
      else
        "404 not found"

routeWatch = () ->
  window.addEventListener(
    'locationchange',
    routerPatcher,
  )

export default router = () ->
  routerPatcher()
  routeWatch()
