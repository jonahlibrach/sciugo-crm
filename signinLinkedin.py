def signIn(driver,luse,lpass):
    signinUrl = 'https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin'
    driver.get(signinUrl)
    driver.find_element_by_id('username').send_keys(luse)
    driver.find_element_by_id('password').send_keys(lpass)
    signinButton = driver.find_element_by_class_name('btn__primary--large')
    signinButton.click()

