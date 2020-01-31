function cb_print(tag, timestamp, record)
    output = ""
    for key, val in pairs(record) do
     output = output .. string.format(" %s => %s,", key, val)
    end

    print(output)

    return 0, 0, 0
end
