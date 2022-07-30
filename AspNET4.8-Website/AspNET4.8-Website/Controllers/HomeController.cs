using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace TailWindTest.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            List<WeatherForecast> forecasts = new List<WeatherForecast>();
            forecasts.Add(new WeatherForecast() { Date = DateTime.Now, TemperatureC = 10, Summary = "Cool AF" });
            forecasts.Add(new WeatherForecast() { Date = DateTime.Now, TemperatureC = 30, Summary = "Hot AF" });
            forecasts.Add(new WeatherForecast() { Date = DateTime.Now, TemperatureC = 20, Summary = "AF" });
            return View(forecasts);
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }

    public class WeatherForecast
    {
        public DateTime Date { get; set; }

        public int TemperatureC { get; set; }

        public string Summary { get; set; }

        public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
    }
}