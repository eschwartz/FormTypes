class StringUtil {
  public static camelCaseToWords(str:string) {
    // Thank you, StackOverflow
    // http://stackoverflow.com/a/4149393/830030
    return str
      // insert a space before all caps
      .replace(/([A-Z])/g, ' $1')
      // uppercase the first character
      .replace(/^./, function(str){ return str.toUpperCase(); })
  }
}

export = StringUtil;