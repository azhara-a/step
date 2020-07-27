// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;
import com.google.sps.data.LoginInfo;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/* Servlet that:
 * in Get request, returns login information 
 */
@WebServlet("/login-status")
public class LoginServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();
    String url;
    if (userService.isUserLoggedIn()) {
      String urlToRedirectToAfterUserLogsOut = "/";
      url = userService.createLogoutURL(urlToRedirectToAfterUserLogsOut);
    } else {
      String urlToRedirectToAfterUserLogsIn = "/index.html#comments";
      url = userService.createLoginURL(urlToRedirectToAfterUserLogsIn);
    }

    boolean isAdmin = userService.isUserLoggedIn() && userService.isUserAdmin();
    LoginInfo loginInfo = new LoginInfo(userService.isUserLoggedIn(), isAdmin, url);
    Gson gson = new Gson();
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(loginInfo));
  }
}